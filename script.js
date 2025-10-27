const socket = io();

// Live results update
socket.on("updateResults", data => {
  const list = document.getElementById("results");
  if (list) {
    list.innerHTML = "";
    const male = data.filter(c => c.gender === "Male");
    const female = data.filter(c => c.gender === "Female");

    list.innerHTML += `<h3>Male Candidates</h3>`;
    male.forEach(c => (list.innerHTML += `<p>${c.name}: ${c.votes}</p>`));

    list.innerHTML += `<h3>Female Candidates</h3>`;
    female.forEach(c => (list.innerHTML += `<p>${c.name}: ${c.votes}</p>`));
  }
});
