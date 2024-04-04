import cliProgress from 'cli-progress'
import { pipeline } from '@xenova/transformers';
import { listImages, writeFileWithFolderCreation } from './utils.js'
import { csvFormat } from 'd3-dsv';

const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const detector = await pipeline('object-detection', 'Xenova/detr-resnet-101');
// faster but less accurate 
// const detector = await pipeline('object-detection', 'Xenova/detr-resnet-50');

const folder = './input'
const images = listImages(folder);

bar.start(images.length, 0);

let dataset = []

for (const imageFileName of images) {
    const url = `${folder}/${imageFileName}`;
    const output = await detector(url);
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
