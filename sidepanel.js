// Print la liste des sessions à l'ouverture du SidePanel
const printSessionList = async () => {
  // Récupère les infos qui on été stockées dans le storage
  const sessionsFromStorage = await chrome.storage.local.get()

  // Reset et print toutes les infos dans le SidePanel (titre de la session et nombre de tabs)
  document.querySelector(".sessionList").innerHTML=""
  for (const session in sessionsFromStorage) {
    printSession(sessionsFromStorage[session], session)
  }
}
printSessionList()

// Print une session
const printSession = (sessionArray, sessionTitle) => {
  // Print le template prédéfini dans index.html et insère le titre de la session et le nombre de tabs correspondant
  const template = document.querySelector(".template")
  const element = template.content.firstElementChild.cloneNode(true)
  element.querySelector(".title").textContent = sessionTitle
  element.querySelector(".tabsNumber").textContent = `${sessionArray.length} tabs`
  document.querySelector(".sessionList").append(element)
}

// Remove une session du storage + reprint la sessionList pour mise à jour sur le SidePanel
const deleteOneSession = async (event) => {
  // Récupère le titre de la session correspondant à l'event click
  const sessionTitle = event.target.parentNode.children[0].textContent
  // Delete la session correspondante stockée dans le storage
  await chrome.storage.local.remove([sessionTitle])
  // Reprint la sessionList dans le SidePanel
  printSessionList()
}

// Récupère les datas de la current Window, enregistre les données dans le storage, demande un titre de session, print la session sur le sidePanel
const addSessionToTheList = async () => {
  // Récupère les data des tabs ouverts dans la current Window
  const getTabsData = async () => {
    // let currentWindow = await chrome.windows.getCurrent({})
    // let allTabsData = await chrome.tabs.query({windowId:currentWindow.id})
    let allTabsData = await chrome.tabs.query({ currentWindow: true })
    return allTabsData
  }

  // Récupère la value de l'input
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
  
  // Enregistre les données dans le storage avec la clé = titre de la session
  await chrome.storage.local.set({ [sessionTitle]: sessionData })
  // Print toute la liste sur le sidePanel
  printSessionList()
}

// Ouvre une nouvelle window avec toutes les tabs enregistrées
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
    // for (const url of urlArray) {
    //   chrome.tabs.create({url})
    // }
    urlArray.forEach(url => chrome.tabs.create({url}))
    chrome.tabs.remove(idFirstTab)
  } else {
    chrome.windows.create({ url: urlArray })
  }
}

document.querySelector(".saveButton")
  .addEventListener("click", addSessionToTheList)

document.querySelector(".sessionList")
  .addEventListener("click", (event) => {
    if (event.target.className === "deleteSession") {
      deleteOneSession(event)
    } else if (event.target.className === 'img') {
      refreshTabs(event)
    } else if (event.target.parentNode.className === "session") {
      openSessionInNewWindow(event)
    }
  })




