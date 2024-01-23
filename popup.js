const mainFunction = async () => {
  // Lorsque je clique sur le bouton :
  // J'enregistre toutes les URL dans le storage
  // Lorsque je clique sur ma tabsSession, toutes les tabs s'ouvrent dans une nouvelle fenêtre

  const getTabsData = async () => {
    // let currentWindow = await chrome.windows.getCurrent({})
    // let allTabsData = await chrome.tabs.query({windowId:currentWindow.id})
    let allTabsData = await chrome.tabs.query({currentWindow:true})
    return allTabsData
  }

  const allTabsData = await getTabsData()
  console.log(allTabsData)

  const sessionTitle = prompt("Quel est le nom de ta session ?")

  const template = document.getElementById("template")
  const elements = new Set()
  // console.log("elements = ", elements)
  const element = template.content.firstElementChild.cloneNode(true)
  // console.log("element = ", element)
  element.querySelector(".title").textContent = sessionTitle
  element.querySelector(".tabsNumber").textContent = `${allTabsData.length} tabs`
  elements.add(element)
  // console.log("elements : ", elements)
  document.querySelector(".tabSession").append(...elements)

}

document.querySelector("button")
.addEventListener("click",mainFunction)




