class Wishlist {
    // product: {id, name, price, summary, image, image_url}
    // qty: 1
    // contents = [
    //    {product: { .. }},
    //    qty: 2}
    // ]
    
    constructor() {
        this.contents = []
    }

    add(product1) {
        let found = false
        for (const item of this.contents) {
            if(item.product1.id === product1.id) {
                found = true
                ++item.qty
            }
        }
        if (!found) {
            this.contents.push({product1,qty: 1})
        }
    }

    getTotal() {
        let sum = 0
        for (const item of this.contents) {
            sum += item.qty * item.product1.price
        }
        return sum
    }

    serialize() {
        return this.contents
    }

    //Wishlist.desrialize(serial_data)
    static deserialize(wdata) {
        const cart = new Wishlist()
        cart.contents = wdata
        return cart
    }
}
module.exports = Wishlist