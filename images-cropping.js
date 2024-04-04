import { readExtensionFiles } from './utils.js'
import fs from 'fs'
import sharp from 'sharp';
import cliProgress from 'cli-progress'

const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const folderPath = './output/metadata';

const jsonFiles = readExtensionFiles(folderPath, '.json');

const score = 0.5

bar.start(jsonFiles.length, 0);

for (const jsonFileName of jsonFiles) {
    const json = JSON.parse(fs.readFileSync(`./output/metadata/${jsonFileName}`));
    const croppings = json.filter(d => d.score >= score)
    const imageFileName = jsonFileName.replace('.json', '');
    const metadata = await sharp(`./input/${imageFileName}`).metadata();
    if (croppings.length > 0) {
        for (const [index, cropping] of croppings.entries()) {
            const { xmax, xmin, ymax, ymin } = cropping.box
            const width = Math.min(metadata.width, xmax) - xmin;
            const height = Math.min(metadata.height, ymax) - ymin;

            if (!fs.existsSync(`./output/cropping/${cropping.label}`)) {
                fs.mkdirSync(`./output/cropping/${cropping.label}`, { recursive: true });
            }
            await sharp(`./input/${imageFileName}`).extract({
                left: xmin < 0 ? 0 : xmin,
                top: ymin < 0 ? 0 : ymin,
                width: width,
                height: height
            }).toFile(`./output/cropping/${cropping.label}/${imageFileName.split('.')[0]}_${index}.jpg`);

        }
    }
    bar.increment();
}

bar.stop();