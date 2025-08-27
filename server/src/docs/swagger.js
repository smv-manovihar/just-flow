import swaggerAutogen from 'swagger-autogen';
import fs from 'fs';

const { version } = JSON.parse(
	fs.readFileSync(new URL('../../package.json', import.meta.url)),
);

const doc = {
	info: {
		title: 'JustFlow API',
		description: 'Auto-generated API docs',
		version,
	},
	host: `localhost:${process.env.PORT || 5000}`,
	schemes: ['http'],
	components: {},
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['../server.js'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
