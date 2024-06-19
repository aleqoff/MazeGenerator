import { MazeGenerator } from './utils/MazeGenerator.mjs'
import fs from 'fs'
//НЕ ТРОГАТЬ - ХУЙ ОТКУШУ
const MAX_WEIGHT = 1000
const PATH_TO_JSON_MAP = 'src/assets/map/map.json'
//задаёт размер карты (в количестве комнат на одну сторону)
const GRID_SIZE = 11

//23 - start, 29 - finish

//всё в тестовом режиме, если нужен метод для обращения, который отдаёт что то а-ля "сервер"
//пиши сам, пока он просто меняет Json, можешь просто вызывать нижеописанные и обращаться напрямую к json`у после этого

//генерит новую карту
const mg = new MazeGenerator(GRID_SIZE, MAX_WEIGHT)
const jsonData = JSON.parse(fs.readFileSync(PATH_TO_JSON_MAP, 'utf-8'))
const result = mg.generateMap(jsonData)
//переписывает json файл с новой картой
fs.writeFileSync(PATH_TO_JSON_MAP, JSON.stringify(result.jsonData, null, 2))

//индексы старта и финиша в массиве ground в слоях json`a
console.log(result.startIndex)
console.log(result.finishIndex)