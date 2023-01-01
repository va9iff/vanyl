import {v, sync, text} from '/src/index.js'


let myView = ()=> v`that's an ${text(212)} test for ${text(5487)} so yeah`

// let myViewV = ()=> v`that's an ${212} test for ${5487} so yeah`

let a = sync(myView, document.body)

a.update()

console.log(a)


