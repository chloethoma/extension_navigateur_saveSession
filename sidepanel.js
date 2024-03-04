/*
  Injecte dans la div .sessionList la liste des sessions disponibles dans le localstorage
*/
  const printSessionList = async () => {
    const sessionsList = await chrome.storage.local.get()
    document.querySelector(".sessionList").innerHTML=""
    for (const session in sessionsList) {
      printSession(sessionsList[session].tabsData, session)
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
    Récupère les data des tabs dans la fenêtre actuelle (current window) et retourne un objet avec les data suivantes : url, tabsId, windowId
  */
  const getTabsData = async () => {
    let allTabsData = await chrome.tabs.query({ currentWindow: true })
    const sessionData = {
      "windowId":allTabsData[0].windowId,
      "tabsData": []
    }
    for (const element of allTabsData) {
      sessionData.tabsData.push({
        "url":element.url,
        "tabId":element.id
      })
    }
    return sessionData
  }
  
  /*
    Update les tabs d'une session déjà enregitrée (bouton refresh) via le windowId :
    Récupère le windowID de la fenêtre actuelle et le compare avec les windowId du storage. Update ensuite la bonne session via un storage set + print sessionList
  */
  const refreshTabs = async () => {
    const currentData = await getTabsData()
    const currentWindowId = currentData.windowId
    const storageData = await chrome.storage.local.get()
  
    for (const session in storageData) {
      if (storageData[session].windowId === currentWindowId) {
        chrome.storage.local.set({[session]:currentData})
      }
    }
    printSessionList()
  }
  
  /*
    Supprime une session :
    Remove la session du storage + print la sessionList à jour
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
  const addSession = async () => {
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
    Ouvre une nouvelle fenêtre avec tous les tabs restaurés, lors du click sur la session que l'utilisateur souhaite ouvrir.
    + MàJ du nouveau windowId dans le storage (pour la fonction refresh)
  */
  const openSession = async (event) => {
    // Récupère les datas de la fenêtre actuelle pour vérifier si c'est une fenêtre de démarrage
    const windowData = await chrome.tabs.query({ currentWindow: true })
    const urlFirstTab = windowData[0].url
    const idFirstTab = windowData[0].id
  
    // Récupère le titre de la session qui a été cliqué, puis les data correpondants dans le storage, push les url des tabs dans un array
    const sessionTitle = event.target.parentNode.children[0].textContent
    const sessionData = await chrome.storage.local.get([sessionTitle])
    const urlArray = []
    for (const element of sessionData[sessionTitle].tabsData) {
      urlArray.push(element.url)
    }
  
    // Dans le cas où la fenêtre actuelle est une fenêtre de démarrage Google, création des onglets dans cette window
    // Else, création d'une nouvelle window avec tous les tabs
    if (urlFirstTab === "chrome://newtab/" && windowData.length === 1) {
      urlArray.forEach(url => chrome.tabs.create({url}))
      chrome.tabs.remove(idFirstTab)
      sessionData[sessionTitle].windowId = windowData[0].windowId
      chrome.storage.local.set({[sessionTitle]:sessionData[sessionTitle]})
    } else {
      const newWindowData = await chrome.windows.create({ url: urlArray })
      sessionData[sessionTitle].windowId = newWindowData.id
      chrome.storage.local.set({[sessionTitle]:sessionData[sessionTitle]})
    }
  }
  
  document.querySelector(".saveButton")
    .addEventListener("click", addSession)
  
  document.querySelector(".refresh_img")
    .addEventListener("click", refreshTabs)
  
  document.querySelector(".sessionList")
    .addEventListener("click", (event) => {
      if (event.target.className === "deleteSession") {
        deleteSession(event)
      } else if (event.target.parentNode.className === "session") {
        openSession(event)
      }
    })