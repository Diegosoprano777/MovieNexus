const fs = require('fs');

const apiKey = process.env.API_KEY || 'c799d8b88696008580f33a7694faf85e';

const envConfigFile = `export const environment = {
  production: true,
  baseUrl: 'https://api.themoviedb.org/3',
  apiKey: '${apiKey}',
  imgPath: 'https://image.tmdb.org/t/p'
};
`;

const envDevConfigFile = `export const environment = {
  production: false,
  baseUrl: 'https://api.themoviedb.org/3',
  apiKey: '${apiKey}',
  imgPath: 'https://image.tmdb.org/t/p'
};
`;

const targetFolderPath = './src/environments';
if (!fs.existsSync(targetFolderPath)) {
  fs.mkdirSync(targetFolderPath, { recursive: true });
}

fs.writeFileSync(`${targetFolderPath}/environment.ts`, envConfigFile);
fs.writeFileSync(`${targetFolderPath}/environment.development.ts`, envDevConfigFile);
console.log('✅ Archivos de entorno (production y development) generados correctamente.');
