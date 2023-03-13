import {Vanyl, v, create, unique} from '/src/index.js'
let query = (...arg) => document.querySelector(...arg)

let users = [
	{key: 1, val: "1prr"},
	{key: 2, val: "sd1prr"},
	{key: 55, val: "f"},
	{key: 6, val: "pr"},
]

query('[swap]').onclick = function (e) {
	users.push(users.shift())
}

query('[update]').onclick = function (e) {
	main.update()
}

query('[test]').onclick = function (e) {
	for (let li of document.querySelectorAll('li')){
		li.style.backgroundColor = Math.random()>0.5 ? "blue" : "red"
	}
}

let mainView = ()=>v`
	<ol>
		${users.map((user, i)=>v`
			<li ${{
				key: user.key,
				style: `top: ${i*1.7}rem`}
			}}>asdf ${user.val}</li>
		`)}
	</ol>
`

let main = create(mainView)
document.body.appendChild(main.root)



