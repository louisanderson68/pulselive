class Playerstats {
    constructor(id, playerList) {
        this.elementId = id;
        // here we have our list but in a business this may come from an API, so would need error handling
        this.playerList = playerList.players;
        this.data  = [];
        this.el = document.getElementById(`${this.elementId}`);
        if (this.el) {
            // we've found the root element we need so let's organise the data
            this.transformData()
        } else {
            console.error(`No element found with ID ${this.elementId}`)
        }
    }

    transformData() {
        // Here we are going to take all the data we need from the JSON and organise it into a new object
        for (let i = 0; i < this.playerList.length ; i++) {
            // stat variables
            let appearances;
            let goals;
            let assists;
            let backPass;
            let fwdPass;
            let mins;
            let position;

            // let's reduce this to be more readable
            let player = this.playerList[i];
            // Get the ID
            let id = player.player.id;
            // Name is a combination of first and last
            let name = player.player.name.first + ' ' + player.player.name.last;
            // position is only a letter so we must calculate what to display
            switch(player.player.info.position) {
                case "D" :
                    position = "Defender";
                    break;
                case "M" :
                    position = "Midfielder";
                    break;
                case "F" :
                    position = "Forward";
                    break;
            }
            // we'll need to remove the spaces from the club name
            let club = player.player.currentTeam.name.replace(/\s/g, '');

            // we'll need to check the stats array and be sure as they vary from player to player
            player.stats.forEach(stat => {
                if (stat.name == "appearances") {
                    appearances = stat.value;
                } else if (stat.name == "goals") {
                    goals = stat.value;
                } else if (stat.name == "goal_assist") {
                    assists = stat.value;
                } else if (stat.name == "backward_pass") {
                    backPass = stat.value;
                } else if (stat.name == "fwd_pass") {
                    fwdPass = stat.value;
                } else if (stat.name == "mins_played") {
                    mins = stat.value;
                } else {

                }
            });

            // goals per match = goals % appearances to two decimal places
            let gpm = (goals / appearances).toFixed(2);
            // passes per minute = backpass + forward pass, then divide by mins played
            let ppm = ((backPass + fwdPass)/mins).toFixed(2);
            // create our new object to use
            this.data.push({
                id, name, position, club, appearances, goals : goals || 0, assists : assists || 0, gpm, ppm
            })
        }

        this.buildDropdown();
    }

    buildDropdown() {
        // build the dropdown dynamically
        // we're using DIV's because select boxes are limited to certain styling
        let el = document.getElementById("playerstats__select--wrapper");
        let select = document.createElement("div");
        select.setAttribute("id", "playerstats__selected");
        select.textContent = "Select a player...";
        // create options wrapper
        let options = document.createElement("div");
        options.setAttribute("id", "playerstats__select-items");
        options.setAttribute("class", "playerstats__select-hide");
        // add options to the fake select box
        for (let player of this.data) {
            let option = document.createElement("div");
            option.setAttribute("class", "playerstats__option");
            option.setAttribute('data-id' , player.id);
            option.textContent = player.name;
            options.appendChild(option);
        }

        el.appendChild(select);
        el.appendChild(options);

        this.handleClicks();
        this.buildHTML("firstLoad");
    }

    handleClicks() {
        let select = document.getElementById("playerstats__selected");
        let options = document.getElementsByClassName("playerstats__option");
        let selectItems = document.getElementById("playerstats__select-items");

        select.addEventListener('click', function(e) {
            /*when the select box is clicked, close any other select boxes,
            and open/close the current select box:*/
            e.stopPropagation();
            this.nextElementSibling.classList.toggle("playerstats__select-hide");
        });

        // make a click event for each option on the dropdown
        for (var i = 0; i < options.length; i++) {
            options[i].addEventListener('click', event => this.handleOptionsClickUpdate(event));
        }

        // close the fake select when document clicked if it's open to emulate select functionality
        document.addEventListener("click", function() {
            if (!selectItems.classList.contains("playerstats__select-hide")) {
                selectItems.classList.add("playerstats__select-hide");
            }
        })
    }

    handleOptionsClickUpdate(event) {
        // we want to close the options
        event.target.parentNode.classList.add("playerstats__select-hide");
        // we need to update the fake label div
        event.target.parentNode.previousSibling.textContent = event.target.textContent;
        // then we pass through the id for the buildHTML
        this.buildHTML(event.target.getAttribute('data-id'));
    }

    buildHTML(id) {
        let player;

        if (id === "firstLoad") {
            player = this.data[0];
        } else {
            this.data.forEach(uniquePlayer => {
                if (uniquePlayer.id == id) {
                    player = uniquePlayer;
                }
            })
        }

        this.html = `
                <div class="playerstats__img--wrapper">
                    <img class="playerstats__img" src="assets/images/p${player.id}.png" alt="${player.name}">
                </div>
                <div class="playerstats__stats--wrapper">
                    <div class="playerstats__stats--header">
                        <div class="playerstats__basicinfo">
                            <h1 class="playerstats__name">${player.name}</h1>
                            <div class="playerstats__position">${player.position}</div>
                        </div>
                        <div class="playerstats__badge--wrapper">
                            <div class="playerstats__badge badge-${player.club}"></div>
                        </div>
                    </div>
                    <table id="playerstats__table">
                        <tbody>
                            <tr>
                                <th>Appearances</th>
                                <td>${player.appearances}</td>
                            </tr>
                            <tr>
                                <th>Goals</th>
                                <td>${player.goals}</td>
                            </tr>
                            <tr>
                                <th>Assists</th>
                                <td>${player.assists}</td>
                            </tr>
                            <tr>
                                <th>Goals per match</th>
                                <td>${player.gpm}</td>
                            </tr>
                            <tr>
                                <th>Passes per minute</th>
                                <td>${player.ppm}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                `;

        this.el.innerHTML = this.html;
    }
}