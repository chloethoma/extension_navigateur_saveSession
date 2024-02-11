/*
  Injecte dans la div .sessionList la liste des sessions disponibles dans le localstorage
*/
const printSessionList = async () => {
  const sessionsFromStorage = await chrome.storage.local.get()
  document.querySelector(".sessionList").innerHTML=""
  for (const session in sessionsFromStorage) {
    printSession(sessionsFromStorage[session], session)
  }
}
printSessionList()

/*
  Injecte dans la div .sessionList une session avec le <template> préfédini dans index.html
*/
const printSession = (sessionArray, sessionTitle) => {
  const template = document.querySelector(".template")
  const element = template.content.firstElementChild.cloneNode(true)
  element.querySelector(".title").textContent = sessionTitle
  element.querySelector(".tabsNumber").textContent = `${sessionArray.length} tabs`
  document.querySelector(".sessionList").append(element)
}

/*
  Récupère les data des tabs dans la fenêtre actuelle
*/
const getTabsData = async () => {
  let allTabsData = await chrome.tabs.query({ currentWindow: true })
  return allTabsData
}

/*
  Update les tabs d'une session déjà enregitrée (bouton refresh)
*/
const refreshTabs = async () => {
  const sessionData = await getTabsData()
  console.log(sessionData)


  // const sessionTitle = event.target.parentNode.firstElementChild.textContent
  // await chrome.storage.local.set({ [sessionTitle]: sessionData })
  // printSessionList()
}

/*
  Supprime une session :
  Remove la session du storage + réinjecte la sessionList à jour
*/
const deleteSession = async (event) => {
  const sessionTitle = event.target.parentNode.children[0].textContent
  await chrome.storage.local.remove([sessionTitle])
  printSessionList()
}


/*
  Sauvegarde une session :
  Récupère les datas de la current Window, enregistre les données dans le storage.
  Recupère le titre de session dans l'input, injecte la sessionList sur le sidePanel
*/
const addSessionToTheList = async () => {
  const inputSession = document.querySelector(".inputSession")
  const inputValue = inputSession.value

  // Ne fait rien si l'input ne contient rien
  if (inputValue === "") {
    return
  }

  // UpperCase la 1ère lettre du nom de la session
  const sessionTitle = inputValue[0].toUpperCase() + inputValue.slice(1)
  inputSession.value=""
  const sessionData = await getTabsData()
  
  await chrome.storage.local.set({ [sessionTitle]: sessionData })
  printSessionList()
}

/*
  Ouvre une nouvelle fenêtre avec tous les tabs restaurés, lors du click sur la session que l'utilisateur souhaite ouvrir :
*/
const openSessionInNewWindow = async (event) => {
  // Récupère les datas de la fenêtre actuelle pour vérifier si c'est une fenêtre de démarrage
  const windowData = await chrome.tabs.query({ currentWindow: true })
  const urlFirstTab = windowData[0].url
  const idFirstTab = windowData[0].id

  // Récupère le titre de la session qui a été cliqué, puis les data correpondants dans le storage, push les url des tabs dans un array
  const sessionTitle = event.target.parentNode.children[0].textContent
  const dataFromStorage = await chrome.storage.local.get()
  const urlArray = []
  for (const element of dataFromStorage[sessionTitle]) {
    urlArray.push(element.url)
  }

  // Dans le cas où la fenêtre actuelle est une fenêtre de démarrage Google, création des onglets dans cette window
  // Else, création d'une nouvelle window avec tous les tabs
  if (urlFirstTab === "chrome://newtab/" && windowData.length === 1) {
    urlArray.forEach(url => chrome.tabs.create({url}))
    chrome.tabs.remove(idFirstTab)
  } else {
    chrome.windows.create({ url: urlArray })
  }
}

document.querySelector(".saveButton")
  .addEventListener("click", addSessionToTheList)

document.querySelector(".refresh_img")
  .addEventListener("click", refreshTabs)

document.querySelector(".sessionList")
  .addEventListener("click", (event) => {
    if (event.target.className === "deleteSession") {
      deleteSession(event)
    } else if (event.target.parentNode.className === "session") {
      openSessionInNewWindow(event)
    }
  })




