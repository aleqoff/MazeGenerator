export class Node {
    constructor(index) {
        this.index = index
        this.edges = []
        this.visited = false
        this.parent = null
        this.rank = 0
    }

    getIndex() {
        return this.index
    }

    addEdge(edge) {
        this.edges.push(edge)
    }

    getEdges() {
        return this.edges
    }

    isVisited() {
        return this.visited
    }

    setVisited(visited) {
        this.visited = visited
    }

    setParent(parent) {
        this.parent = parent
    }

    getParent() {
        return this.parent
    }

    getRank() {
        return this.rank
    }

    setRank(rank) {
        this.rank = rank
    }
}
