import { UnionFind } from './UnionFind.mjs'

export class Kruskal {
    constructor(edges) {
        this.edges = edges
        this.mst = []
    }

    findMST() {
        // Сортируем ребра по весу
        this.edges.sort((a, b) => a.getWeight() - b.getWeight())

        // Формируем минимальное остовное дерево
        const uf = new UnionFind(this.edges.length)
        for (const edge of this.edges) {
            const sourceIndex = edge.getSource().getIndex()
            const destinationIndex = edge.getDestination().getIndex()

            if (uf.union(sourceIndex, destinationIndex)) {
                this.mst.push(edge)
            }
        }

        return this.mst
    }
}