

console.log('Footermenu.js is being executed');

const assetContent = document.getElementById("assetscontent");
assetContent.addEventListener("click", () => {
      alert('Asset menu clicked');
      //loadContent(textToCopy);
});

// Function to copy text to clipboard
function loadContent(sourcepage,targetelementid) {
      navigator.clipboard.writeText(sourcepage)
        .then(() => {
          alert("Copied to clipboard: " + sourcepage);
        })
        .catch(err => {
          console.error('Unable to copy text: ', err);
        });
}















