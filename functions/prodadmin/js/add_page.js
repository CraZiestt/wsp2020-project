function add_page() {
    auth('prodadmin@test.com', add_page_secured, '/login')
}

let glImageFile2Add; //file selected by imageButton

function add_page_secured() {
    glPageContent.innerHTML = '<h1>Add Page</h1>'
    glPageContent.innerHTML = `
        <a href='/home' class="btn btn-outline-primary">Home</a>
        <a href='/show' class="btn btn-outline-primary">Show Products</a>
        <div class="form-group">
            Name: <input class="form-control" type="text" id="name" />
            <p id="name_error" style="color:red;" />
        </div>
        <div class="form-group">
            Summary:<br>
            <textarea class="form-control" id="summary" cols="40" rows="5"></textarea>
            <p id="summary_error" style="color:red;" />
        </div>
        <div class="form-group">
            Price: <input class="form-control" type="text" id="price" />
            <p id="price_error" style="color:red;" />
        </div>
        <div id="wrapper">
            Image: <input type="file" accept="image/*" id="imageButton" value="upload" onchange="preview_image()"/>
            <p id="image_error" style="color:red;" />
        </div>
        <div id="wrapper">
        <img id="output_image"/>
</div>
        <button class="btn btn-primary" type="button" onclick="preview_image()">Add</button>
        
    `;

    const imageButton = document.getElementById('imageButton')
    imageButton.addEventListener('change', e => {
        glImageFile2Add = e.target.files[0] 
        
        // console.log('file upload', e.target.files[0])
    })
    
    
}

async function preview_image() 
{
        const name = document.getElementById('name').value
        const summary = document.getElementById('summary').value
        let price = document.getElementById('price').value
    
            // input validation 
        const nameErrorTag = document.getElementById('name_error')
        const summaryErrorTag = document.getElementById('summary_error')
        const priceErrorTag = document.getElementById('price_error')
        const imageErrorTag = document.getElementById('image_error')
    
        nameErrorTag.innerHTML = validate_name(name)
        summaryErrorTag.innerHTML = validate_summary(summary)
        priceErrorTag.innerHTML = validate_price(price)
        imageErrorTag.innerHTML = !glImageFile2Add ? 'Error: image file not selected' : null

        if (nameErrorTag.innerHTML || summaryErrorTag.innerHTML 
            || priceErrorTag.innerHTML || imageErrorTag.innerHTML) {
                return
            }

     
    try {        
        const image = Date.now() + glImageFile2Add.name //unique name
        const ref = firebase.storage().ref(IMAGE_FOLDER + image)
        const taskSnapshot = await ref.put(glImageFile2Add)
        const image_url = await taskSnapshot.ref.getDownloadURL()
        glPageContent.innerHTML =`
        <div class="form-group">
            Name: <input class="form-control" type="text" id="name"  value="${name}" ReadOnly />
            <p id="name_error" style="color:red;"/>
        </div>
        <div class="form-group">
            Summary:<br>
            <textarea class="form-control" id="summary" cols="40" rows="5"  ReadOnly>${summary}</textarea>
            <p id="summary_error" style="color:red;" />
        </div>
        <div class="form-group">
            Price: <input class="form-control" type="text" id="price" value="${price}" ReadOnly/>
            <p id="price_error" style="color:red;" />
        </div>
        <div id="wrapper">
        <img src="${image_url}" style="width:100px; height:100px;"/>
        </div>
        <div id="wrapper">
        <img id="output_image"/>
</div>        
        <br>
        <button class="btn btn-primary" onclick="addProduct('${name}','${summary}','${price}')">addProduct</button>
        
        `
    
    }
    catch (e){
        glPageContent.innerHTML ==="Could not add image:"+e
    }
}


async function addProduct(name, summary, price) {
   
    
   
    // now ready to add the product into firebase
    try { 
        const image = Date.now() + glImageFile2Add.name //unique name
        const ref = firebase.storage().ref(IMAGE_FOLDER + image)
        const taskSnapshot = await ref.put(glImageFile2Add)
        const image_url = await taskSnapshot.ref.getDownloadURL()

        price = Number(price)
       await firebase.firestore().collection(COLLECTION).doc()
                .set({name, summary, price, image, image_url})
        
         // console.log('image_url', image_url)
         glPageContent.innerHTML =`
         <h1>${name} is added</h1>
         <a href="/show" class="btn-outline-primary">show all</a>
         `;

    } catch (e) {
        glPageContent.innerHTML = `
        <h1>Cannot add a product</h1>
        ${JSON.stringify(e)}
        `;

     }
 }




