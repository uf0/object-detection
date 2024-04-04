import cliProgress from 'cli-progress'
import { AutoModel, AutoProcessor, RawImage } from '@xenova/transformers';
import { listImages, writeFileWithFolderCreation } from './utils.js'
import { csvFormat } from 'd3-dsv';

const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const model = await AutoModel.from_pretrained('Xenova/yolov9-e')
const processor = await AutoProcessor.from_pretrained('Xenova/yolov9-e');

const folder = './input'
const images = listImages(folder);

bar.start(images.length, 0);

let dataset = []

for (const imageFileName of images) {
    const url = `${folder}/${imageFileName}`;
    const image = await RawImage.read(url);
    const { pixel_values } = await processor(image);

    // Run object detection
    const { outputs } = await model({ images: pixel_values })
    const output = outputs.tolist().map(([xmin, ymin, xmax, ymax, score, id]) => {
        return {
            box: {
                xmin: Math.round(xmin),
                ymin: Math.round(ymin),
                xmax: Math.round(xmax),
                ymax: Math.round(ymax)
            },
            score: score,
            label: model.config.id2label[id]

        }
    });
    const lines = output.map(d => {
        const { xmax, xmin, ymax, ymin } = d.box
        const out = { ...d, xmax, xmin, ymax, ymin, image: imageFileName }
        delete out.box
        return out
    });
    dataset = [...dataset, ...lines];
    writeFileWithFolderCreation(`./output/metadata/${imageFileName}.json`, JSON.stringify(output));
    bar.increment();
}

writeFileWithFolderCreation('./output/dataset.csv', csvFormat(dataset));
bar.stop();
