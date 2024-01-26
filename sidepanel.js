// Itérations :
// Clean le code

// Print la liste des sessions à l'ouverture du SidePanel
const printSessionList = async () => {
  // Récupère les infos qui on été stockées dans le storage
  const sessionsFromStorage = await chrome.storage.local.get()

  // Reset et print toutes les infos dans le SidePanel (titre de la session et nombre de tabs)
  document.getElementById("sessionList").innerHTML=""
  for (const session in sessionsFromStorage) {
    printSession(sessionsFromStorage[session], session)
  }
}
printSessionList()

// Print une session
const printSession = (sessionArray, sessionTitle) => {
  // Print le template prédéfini dans index.html et insère le titre de la session et le nombre de tabs correspondant
  const template = document.getElementById("template")
  const element = template.content.firstElementChild.cloneNode(true)
  element.querySelector(".title").textContent = sessionTitle
  element.querySelector(".tabsNumber").textContent = `${sessionArray.length} tabs`
  document.getElementById("sessionList").append(element)
}

// Delete tout le storage et le SidePanel --> refaire deux fonctions séparées
const deleteStorageAndClearSidePanel = async () => {
  // Clear tout le storage
  await chrome.storage.local.clear()

  // Supprime tous les éléments enfants de la div Tabs Session
  const parentDiv = document.getElementById("sessionList")
  let childDiv = parentDiv.firstChild
  while (childDiv) {
    parentDiv.removeChild(childDiv)
    childDiv = parentDiv.firstChild
  }
}

// Supprime une session du storage + reprint la sessionList pour mise à jour sur le SidePanel
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

  const sessionTitle = prompt("Quel est le nom de ta session ?")
  const sessionData = await getTabsData()

  // Enregistre les données dans le storage avec la clé = titre de la session
  await chrome.storage.local.set({ [sessionTitle]: sessionData })
  // Print la session sur le sidePanel
  printSession(sessionData, sessionTitle)
}

// Ouvre une nouvelle window avec toutes les tabs enregistrées
const openSessionInNewWindow = async (event) => {
  const sessionTitle = event.target.parentNode.children[0].textContent
  const dataFromStorage = await chrome.storage.local.get()
  const urlArray = []
  for (const element of dataFromStorage[sessionTitle]) {
    urlArray.push(element.url)
  }
  chrome.windows.create({ url: urlArray })
}

document.getElementById("saveButton")
  .addEventListener("click", addSessionToTheList)

document.getElementById("deleteAllSession")
  .addEventListener("click", deleteStorageAndClearSidePanel)

document.getElementById("sessionList")
  .addEventListener("click", (event) => {
    if (event.target.className === "deleteSession") {
      deleteOneSession(event)
    } else if (event.target.parentNode.className === "session") {
      openSessionInNewWindow(event)
    }
  })




