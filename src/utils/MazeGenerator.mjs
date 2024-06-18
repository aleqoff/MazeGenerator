import { Node } from '../details/Node.mjs'
import { Edge } from '../details/Edge.mjs'
import { Kruskal } from './Kruskal.mjs'
import {Cell} from '../details/Cell.mjs'
import fs from 'fs'
//стены - 1
//полости - 3

export class MazeGenerator {
    constructor(gridSize, maxWeight) {
        this.gridSize = gridSize
        this.maxWeight = maxWeight
        this.maze = this.createEmptyMaze()
    }

    //задаёт кучу пустых ячеек по форме лабиринта
    createEmptyMaze(){
        const maze = []
        for (let row = 0; row < this.gridSize; row++){
            const rowCells = []
            for (let col = 0; col < this.gridSize; col++){
                rowCells.push(new Cell())
            }
            maze.push(rowCells)
        }
        return maze
    }

    //генерация крускалом
    generateMaze() {
        const nodes = []
        const edges = []
    
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            nodes.push(new Node(i))
        }
        //помечаем рёбра соединений
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (row - 1 >= 0) {
                    const nEdge = new Edge(nodes[(row - 1) * this.gridSize + col], nodes[row * this.gridSize + col], Math.floor(Math.random() * this.maxWeight))
                    edges.push(nEdge)
                }
                if (row + 1 < this.gridSize) {
                    const nEdge = new Edge(nodes[(row + 1) * this.gridSize + col], nodes[row * this.gridSize + col], Math.floor(Math.random() * this.maxWeight))
                    edges.push(nEdge)
                }
                if (col - 1 >= 0) {
                    const nEdge = new Edge(nodes[row * this.gridSize + col - 1], nodes[row * this.gridSize + col], Math.floor(Math.random() * this.maxWeight))
                    edges.push(nEdge)
                }
                if (col + 1 < this.gridSize) {
                    const nEdge = new Edge(nodes[row * this.gridSize + col + 1], nodes[row * this.gridSize + col], Math.floor(Math.random() * this.maxWeight))
                    edges.push(nEdge)
                }
            }
        }
    
        const kruskal = new Kruskal(edges)
        this.mst = kruskal.findMST()
    
        // обновляем стены в ячейках
        for (const edge of this.mst) {
            const sourceIndex = edge.getSource().getIndex()
            const destIndex = edge.getDestination().getIndex()
            const sourceRow = Math.floor(sourceIndex / this.gridSize)
            const sourceCol = sourceIndex % this.gridSize
            const destRow = Math.floor(destIndex / this.gridSize)
            const destCol = destIndex % this.gridSize
    
            if (sourceRow === destRow) {
                if (sourceCol < destCol) {
                    this.maze[sourceRow][sourceCol].rightWall = false
                    this.maze[destRow][destCol].leftWall = false
                } else {
                    this.maze[sourceRow][sourceCol].leftWall = false
                    this.maze[destRow][destCol].rightWall = false
                }
            } else {
                if (sourceRow < destRow) {
                    this.maze[sourceRow][sourceCol].downWall = false
                    this.maze[destRow][destCol].upWall = false
                } else {
                    this.maze[sourceRow][sourceCol].upWall = false
                    this.maze[destRow][destCol].downWall = false
                }
            }
        }
    }
    generateMap(jsonData) {
        const gridSize = this.gridSize
        const gridScale = (gridSize * 4) + 1
        const groundLayer = jsonData.layers[0]
        const wallLayer = jsonData.layers[1]
        this.generateMaze()
        const wallTileData = new Array((gridSize*4 + 1) * (gridSize*4 + 1)).fill(0)

        const possibleFinishIndexes = new Array
        const possibleStartIndexes = new Array
        const groundTileData = new Array((gridSize*4 + 1) * (gridSize*4 + 1)).fill(361)
        
        //расстановка на карте стен  
        for(let row = 0; row < this.gridSize; row++){
            for (let col = 0; col < this.gridSize; col++){
                const cell = this.maze[row][col]
                this.editCrossing(wallTileData, gridScale*4*row + 4*col, row, col)
                if (cell.upWall){
                    this.editHorizontalWall(wallTileData, gridScale*4*row + 2 + 4*col)
                }
                if (cell.downWall){
                    this.editHorizontalWall(wallTileData, gridScale*4*row + 2 + 4*col + gridScale*4)
                }
                if (cell.leftWall){
                    this.editVerticalWall(wallTileData, gridScale*4*row + 4*col + gridScale*2)
                }
                if (cell.rightWall) {
                    this.editVerticalWall(wallTileData, gridScale*4*row + 4*col + gridScale*2 + 4)
                }
                

                if (row === 0 || col === 0 || row === 0 || row === this.gridSize - 1 || col === this.gridSize - 1){
                    possibleFinishIndexes.push(gridScale*4*row + 2 + 4*col + gridScale*2)
                    //Н-П угол
                    if ((col === this.gridSize - 1) && (row === this.gridSize - 1)){
                        this.editCrossing(wallTileData, gridScale*4*row + 4*col + 4 + gridScale*4, row, col)
                    }
                    //правая между углами линия
                    if (col === this.gridSize - 1) {
                        this.editCrossing(wallTileData, gridScale*4*row + 4*col + 4, row, col)
                    }
                    //нижняя между углами линия
                    if (row === this.gridSize - 1){
                        this.editCrossing(wallTileData, gridScale*4*row + 4*col + gridScale*4, row, col)
                    }
                }else{
                    if (gridSize % 2 === 0){
                        if((row === gridSize / 2 || row === (gridSize / 2) - 1) && (col === gridSize / 2 || col === (gridSize / 2) - 1)){
                            possibleStartIndexes.push(gridScale*4*row + 2 + 4*col + gridScale*2)
                        }
                    } else{
                        if (row === (gridSize - 1) / 2 && col === (gridSize - 1) / 2){
                            possibleStartIndexes.push(gridScale*4*row + 2 + 4*col + gridScale*2)
                        }
                    }
                }
            }
        }
        //выбор рандомных из массивов точек и расстановка их в массиве слоя земли
        const startIndex = possibleStartIndexes[Math.floor(Math.random() * possibleStartIndexes.length)]
        const finishIndex = possibleFinishIndexes[Math.floor(Math.random() * possibleFinishIndexes.length)]

        groundTileData[startIndex] = 23
        groundTileData[finishIndex] = 29
        //меняет размеры карты будущего json`a
        jsonData.height = gridScale
        jsonData.width = gridScale
        jsonData.layers[0].height = gridScale
        jsonData.layers[0].width = gridScale
        jsonData.layers[1].height = gridScale
        jsonData.layers[1].width = gridScale
        //меняет массивы слоёв будущего json`a
        wallLayer.data = wallTileData
        groundLayer.data = groundTileData

        return {jsonData, 
            startIndex, 
            finishIndex}

    }
    //вывод лабиринта
    // printMaze(jsonData) {
    //     const gridSize = jsonData.width
    //     const gridScale = (gridSize * 4) + 1
    //     this.generateMaze()
    //     const newJsonData = this.convertMaze(jsonData)
    //     const tileData = newJsonData.layers.find(layer => layer.type === 'tilelayer').data
    //     const writeStream = fs.createWriteStream('maze.txt', { flags: 'w' })
    //     let mazeLine = ""

    //     for (let i = 0; i < tileData.length; i++){
    //         if ((i + 1) % (gridScale) === 0){
    //             mazeLine += tileData[i]
    //             writeStream.write(mazeLine + '\n')
    //             mazeLine = ""
    //         } else {
    //             mazeLine += tileData[i]
    //         }
    //     }
    //     return newJsonData
    // }

    // printTest(){
    //     const gridSize = 10
    //     const gridScale = (gridSize * 4) + 1

    //     const testArray = new Array((gridSize*4 + 1) * (gridSize*4 + 1)).fill('0')

    //     for (let i = 0 i < testArray.length i++) {
    //         if (i < 10){
    //             testArray[i] = '000' + i + ' '
    //         } else if (i < 100){
    //             testArray[i] = '00' + i + ' '
    //         } else if (i < 1000){
    //             testArray[i] = '0' + i + ' '
    //         } else {
    //             testArray[i] = i + ' '
    //         }
    //     }
    //     let testLine = ""
    //     for (let i = 0 i<testArray.length i++){
    //         if ((i + 1) % (gridScale) === 0){
    //             testLine += testArray[i]
    //             console.log(testLine)
    //             testLine = ""
    //         } else {
    //             testLine += testArray[i]
    //         }
    //     }
    // }


    //заолпняет горизонтальную стену 3х1 стенами
    editHorizontalWall(Array, centerIndex){
        Array.fill(28, centerIndex-1, centerIndex+2)
    }
    //заполняет вертикальную стену 1х3 стенами
    editVerticalWall(Array, centerIndex){
        Array[centerIndex - (this.gridSize*4+1)] = 22
        Array[centerIndex] = 22
        Array[centerIndex + (this.gridSize*4+1)] = 22 
    }
    //заполняет перекрестие в зависимости от случая
    editCrossing(Array, crossIndex, row, col){
        const cell = this.maze[row][col]
        //верхняя линия
        if (crossIndex < this.gridSize*4 + 1){
            //Л-В угол
            if (crossIndex === 0){
                Array[crossIndex] = 20
            //П-В угол
            } else if (crossIndex === this.gridSize*4){
                Array[crossIndex] = 27
            //верхняя между углами линия
            } else{
                if (cell.leftWall){
                    Array[crossIndex] = 30
                } else {
                    Array[crossIndex] = 28
                }
            }
        //нижняя линия
        } else if (crossIndex >= (this.gridSize * 4 + 1) * this.gridSize * 4){
            //Л-Н угол
            if (crossIndex === (this.gridSize * 4 + 1) * this.gridSize * 4){
                Array[crossIndex] = 24
            //П-Н угол
            } else if (crossIndex === (this.gridSize * 4 + 1) * (this.gridSize * 4 + 1) - 1){
                Array[crossIndex] = 31
            //нижняя между углами линия
            }else {
                if (cell.leftWall){
                    Array[crossIndex] = 33
                } else {
                    Array[crossIndex] = 28
                }
            }
            //левая между углами линия
        } else if (crossIndex % (this.gridSize * 4 + 1) === 0){
            if (cell.upWall) {
                Array[crossIndex] = 25
            } else {
                Array[crossIndex] = 22
            }
            //правая между углами линия
        } else if ((crossIndex + 1) % (this.gridSize * 4 + 1) === 0){
            if (cell.upWall) {
                Array[crossIndex] = 32
            } else {
                Array[crossIndex] = 22
            }
            //центр
        } else{
            const upCrossWall = this.maze[row-1][col].leftWall
            const downCrossWall = cell.leftWall
            const leftCrossWall = this.maze[row][col-1].upWall
            const rightCrossWall = cell.upWall
            if (upCrossWall && downCrossWall && leftCrossWall && rightCrossWall){
                Array[crossIndex] = 34
            } else if (!upCrossWall && downCrossWall && leftCrossWall && rightCrossWall){
                Array[crossIndex] = 30
            } else if (upCrossWall && !downCrossWall && leftCrossWall && rightCrossWall){
                Array[crossIndex] = 33
            } else if (upCrossWall && downCrossWall && leftCrossWall && !rightCrossWall){
                Array[crossIndex] = 32
            } else if (upCrossWall && downCrossWall && !leftCrossWall && rightCrossWall){
                Array[crossIndex] = 25
            } else if (!upCrossWall && downCrossWall && leftCrossWall && !rightCrossWall){
                Array[crossIndex] = 27
            } else if (!upCrossWall && downCrossWall && !leftCrossWall && rightCrossWall){
                Array[crossIndex] = 20
            } else if (upCrossWall && !downCrossWall && leftCrossWall && !rightCrossWall){
                Array[crossIndex] = 31
            } else if (upCrossWall && !downCrossWall && !leftCrossWall && rightCrossWall){
                Array[crossIndex] = 24
            } else if (upCrossWall && downCrossWall && !leftCrossWall && !rightCrossWall){
                Array[crossIndex] = 22
            } else if (!upCrossWall && !downCrossWall && leftCrossWall && rightCrossWall){
                Array[crossIndex] = 28
            } else if (upCrossWall && !downCrossWall && !leftCrossWall && !rightCrossWall){
                Array[crossIndex] = 21
            } else if (!upCrossWall && !downCrossWall && leftCrossWall && !rightCrossWall){
                Array[crossIndex] = 26
            } else if (!upCrossWall && !downCrossWall && !leftCrossWall && rightCrossWall){
                Array[crossIndex] = 19
            } else if (!upCrossWall && downCrossWall && !leftCrossWall && !rightCrossWall){
                Array[crossIndex] = 18
            } else{
                console.log('Какого хуя?')
            }
        }
    }
    inEdge(index, edge) {
        return index === edge.getDestination().getIndex() || index === edge.getSource().getIndex()
    }

    inMST(index1, index2) {
        for (const edge of this.mst) {
            if ((edge.getSource().getIndex() === index1 && edge.getDestination().getIndex() === index2) ||
                (edge.getSource().getIndex() === index2 && edge.getDestination().getIndex() === index1)) {
                return true
            }
        }
        return false
    }

}