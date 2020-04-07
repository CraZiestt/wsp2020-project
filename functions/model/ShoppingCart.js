class ShoppingCart {
    // product: {id, name, price, summary, image, image_url}
    // qty: 1
    // contents = [
    //    {product: { .. }},
    //    qty: 2}
    // ]
    
    constructor() {
        this.contents = []
    }

    add(product) {
        let found = false
        for (const item of this.contents) {
            if(item.product.id === product.id) {
                found = true
                ++item.qty
            }
        }
        if (!found) {
            this.contents.push({product,qty: 1})
        }
    }

    getTotal() {
        let sum = 0
        for (const item of this.contents) {
            sum += item.qty * item.product.price
        }
        return sum
    }

    serialize() {
        return this.contents
    }

    //ShoppingCart.desrialize(serial_data)
    static deserialize(sdata) {
        const cart = new ShoppingCart()
        cart.contents = sdata
        return cart
    }
    subqty(product) {
        let found = false
        let ref = 0
        for (const item of this.contents) {
            if(item.product.id === product.id) {
                ref = this.contents.indexOf(item)
                if(item.qty > 1)
                --item.qty
                else 
                found = true
               }
            }
         if (found) {
                for(let i=ref; i< this.contents.length; i++){
                    delete this.contents[i];
                    this.contents[i] = this.contents[i+1]
                }  
             this.contents.pop();    
        }
        
        
    }
}

module.exports = ShoppingCart