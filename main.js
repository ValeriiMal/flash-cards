import './style.css'
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, set } from "firebase/database";
import { v4 as uuid } from 'uuid'

const appModel = getAppModel()

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6CY60GuOl4s_o6tHcucD-uO0TU-jo3m0",
  authDomain: "flash-cards-72c15.firebaseapp.com",
  projectId: "flash-cards-72c15",
  storageBucket: "flash-cards-72c15.appspot.com",
  messagingSenderId: "870371364756",
  appId: "1:870371364756:web:657de22271f8c7a2bd8981",
  databaseURL: "https://flash-cards-72c15-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

onValue(ref(database), (sn) => {
	appModel.mainSide = sn.val().app.mainSide
	appModel.cardById = sn.val().app.cards
	renderApp(appModel)
})

renderApp(appModel)

function getAppModel() {
	return {
		mainSide: 'A',
		cardById: {},
	}
}

function renderApp(model) {
	getAppEl().innerHTML = ''

	const menu = createMenu()
	renderMenu(menu)

	const addCardDialog = createAddCardDialog()
	addCardDialog.querySelector('#add-card-dialog-cancel').addEventListener('click', () => {
		addCardDialog.close()
	})
	addCardDialog.querySelector('#add-card-dialog-submit').addEventListener('click', () => {
const formData = new FormData(addCardDialog.querySelector('form'))
		addCard({
			sideA: formData.get('side-a'),
			sideB: formData.get('side-b'),
		})
		addCardDialog.close()
	})
	renderDialog(addCardDialog)

	const cardList = getCardList(model)
	renderCardList(cardList)
}

function renderMenu(menu) {
	getAppEl().appendChild(menu)
}

function createMenu() {
	const root = document.createElement('div')

	const addCardButton = createAddCardButton()
	addCardButton.addEventListener('click', openAddCardDialog)

	const switchSideButton = createSwitchSideButton()
	switchSideButton.addEventListener('click', switchSide)

	root.appendChild(addCardButton)
	root.appendChild(switchSideButton)
	return root
}

function createAddCardButton() {
	const root = document.createElement('button')
	root.innerHTML = 'Add card'
	return root
}

function createSwitchSideButton() {
	const root = document.createElement('button')
	root.innerHTML = 'Switch side'
	return root
}

function switchSide() {
	const nextSide = appModel.mainSide === 'A' ? 'B' : 'A'
	const db = getDatabase();
	set(ref(db, 'app/mainSide'), nextSide);
}

function addCard(data) {
	const db = getDatabase();
	const id = uuid()
	set(ref(db, 'app/cards/' + id), {
		id,
		createdAt: (new Date()).toISOString(),
		sideAText: data.sideA,
		sideBText: data.sideB,
	});
}

function removeCard(id) {
	const db = getDatabase();
	set(ref(db, 'app/cards/' + id), null);
}

function renderDialog(dialog) {
	getAppEl().appendChild(dialog)
}

function createAddCardDialog() {
	const root = document.createElement('dialog')
	root.id = 'add-card-dialog'
	root.innerHTML = `
		<form>
			<input name="side-a" placeholder="Side A" />
			<input name="side-b" placeholder="Side B" />
			<button id="add-card-dialog-cancel" type="button">Cancel</button>
			<button id="add-card-dialog-submit" type="button">Submit</button>
		</form>
	`
	return root
}

function openAddCardDialog() {
	const dialog = getAddCardDialog()
	dialog.show()
}

function renderCardList(cardList) {
	cardList.forEach((card) => {
		renderCard(card)
	})
}

function getCardList(model) {
	const cardModelList = Object.values(model.cardById)
	const mainSide = appModel.mainSide
	return cardModelList.map(cardModel => {
		const elem = createCard({
			model: cardModel,
			mainSide,
		})
		elem.querySelector('button').addEventListener('click', () => removeCard(cardModel.id))
		return elem
	})
}


function renderCard(card) {
	getAppEl().appendChild(card)
}

function createCard(options) {
	const { model: { sideAText, sideBText }, mainSide = 'A' } = options
	const root = document.createElement('div')
	root.style.display = 'flex'
	root.innerHTML = `
		<details>
			<summary>${mainSide === 'A' ? sideAText : sideBText}</summary>
			<p>${mainSide === 'A' ? sideBText : sideAText}</p>
		</details>
		<button>Remove</button>
	`
	return root
}

function getAppEl() {
	return document.querySelector('#app')
}

function getAddCardDialog() {
	return document.querySelector('#add-card-dialog')
}
