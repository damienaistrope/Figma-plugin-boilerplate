import { build, BuildResult } from 'esbuild'
import { Liquid } from 'liquidjs'
import path from 'path'
import fs from 'fs'

const packageConfig = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

build({
	entryPoints: ['src/controller/index.ts'],
	bundle: true,
	outfile: `build/${packageConfig.figma.main}`,
	target: ['es2016'],
})

build({
	entryPoints: ['src/ui/index.tsx'],
	bundle: true,
	write: false,
	target: ['es2016'],
}).then((value: BuildResult) => {	
	if (value.outputFiles && value.outputFiles.length > 0) {
		const buildContents: BufferSource = value.outputFiles[0].contents
		const buildString = new TextDecoder('utf-8').decode(buildContents)

		const engine = new Liquid({
			root: path.resolve(__dirname, 'ui/views/'),
			extname: '.liquid'
		})

		engine
			.renderFile('ui', {
				title: packageConfig.figma.name,
				script: buildString
			})
			.then((output: string) => {
				fs.writeFile(`build/${packageConfig.figma.ui}`, output, (error) => {
					if (error) {
						return console.log(error)
					}
				})

				fs.writeFile(`build/manifest.json`, JSON.stringify(packageConfig.figma), (error) => {
					if (error) {
						return console.log(error)
					}
				})
			})
	}
}).catch((error: any) => {
	console.error('Error:', error)
})
