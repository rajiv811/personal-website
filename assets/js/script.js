function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

// Open the modal
function openModal(imageSrc,text) {
  var modal = document.getElementById("myModal");
  var modalImg = document.getElementById("modalImg");
  var modalText = document.getElementById("modalText");
  modal.style.display = "block";
  modalImg.src = imageSrc;
  modalText.textContent = text;
}

// Close the modal
function closeModal() {
  var modal = document.getElementById("myModal");
  modal.style.display = "none";
}