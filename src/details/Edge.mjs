export class Edge {
    constructor(source, destination, weight) {
        this.source = source
        this.destination = destination
        this.weight = weight
    }

    getSource() {
        return this.source
    }

    getDestination() {
        return this.destination
    }

    getWeight() {
        return this.weight
    }
}