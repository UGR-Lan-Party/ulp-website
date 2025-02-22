const card = document.getElementById("holo-card");

card.addEventListener("mousemove", (event) => {
  card.classList.remove("holo-animation");
  const pointerX = event.clientX;
  const pointerY = event.clientY;

  const cardRec = card.getBoundingClientRect();

  const halfWidth = cardRec.width / 2;
  const halfHeight = cardRec.height / 2;

  const cardCenterX = cardRec.left + halfWidth;
  const cardCenterY = cardRec.top + halfHeight;

  const deltaX = pointerX - cardCenterX;
  const deltaY = pointerY - cardCenterY;

  const rx = deltaY / halfHeight;
  const ry = deltaX / halfWidth;

  const distanceToTheCenter = Math.sqrt(
    Math.pow(deltaX, 2) + Math.pow(deltaY, 2)
  );

  const maxDistance = Math.max(halfWidth, halfHeight);
  const degree = (distanceToTheCenter * 10) / maxDistance;

  card.style.transform = `perspective(1500px) rotate3D(${rx}, ${-ry}, 0, ${degree}deg)`;

  console.log(cardRec);
});

card.addEventListener("mouseleave", () => {
  card.style = `perspective(1500px) rotate3D(0, 0, 0, 0deg)`;
  card.classList.add("holo-animation");
});
