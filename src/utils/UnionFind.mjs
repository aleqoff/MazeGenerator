export class UnionFind {
    constructor(n) {
        this.parent = new Array(n).fill().map((_, index) => index)
        this.rank = new Array(n).fill(1)
    }

    findSet(a) {
        if (a === this.parent[a]) {
            return a
        } else {
            return this.parent[a] = this.findSet(this.parent[a])
        }
    }

    union(a, b) {
        let ra = this.findSet(a)
        let rb = this.findSet(b)

        if (ra === rb) {
            return false
        } else {
            if (this.rank[ra] < this.rank[rb]) {
                this.parent[ra] = rb
            } else if (this.rank[ra] > this.rank[rb]) {
                this.parent[rb] = ra
            } else {
                this.parent[rb] = ra
                this.rank[ra]++
            }

            return true
        }
    }
}
