const displayWhenOpenSidePanel = async () => {
  const sessionsFromStorage = await chrome.storage.local.get()
  // console.log("sessionsFromStorage :", sessionsFromStorage)
  for (const session in sessionsFromStorage) {
    displaySession(sessionsFromStorage[session], session)
  }
}
displayWhenOpenSidePanel()

const deleteStorageAndClearSidePanel = async () => {
  await chrome.storage.local.clear()
  const parentDiv = document.querySelector(".tabsSessions")
  let childDiv = parentDiv.firstChild
  
  while (childDiv) {
    parentDiv.removeChild(childDiv)
    childDiv = parentDiv.firstChild
  }
}

const displaySession = (sessionArray, sessionTitle) => {
  const template = document.getElementById("template")
  const elements = new Set()
  const element = template.content.firstElementChild.cloneNode(true)
  element.querySelector(".title").textContent = sessionTitle
  element.querySelector(".tabsNumber").textContent = `${sessionArray.length} tabs`
  elements.add(element)
  document.querySelector(".tabsSessions").append(...elements)
}

const saveSession = async () => {
  const getTabsData = async () => {
    // let currentWindow = await chrome.windows.getCurrent({})
    // let allTabsData = await chrome.tabs.query({windowId:currentWindow.id})
    let allTabsData = await chrome.tabs.query({ currentWindow: true })
    return allTabsData
  }

  const sessionTitle = prompt("Quel est le nom de ta session ?")
  
  const sessionTabsData = await getTabsData()
  console.log("allTabsData : ", sessionTabsData)
  await chrome.storage.local.set({[sessionTitle]:sessionTabsData})

  displaySession(sessionTabsData, sessionTitle)
}

const restoreSessionInNewWindow = () => {

}

document.getElementById("saveButton")
  .addEventListener("click", saveSession)

document.getElementById("deleteButton")
  .addEventListener("click", deleteStorageAndClearSidePanel)






