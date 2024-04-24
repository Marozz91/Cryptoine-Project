/// <reference path="jquery-3.7.0.js"/>

$(() => {

  // Navigation Hendler
  $(".nav-link").on("click", function () {


    $(".nav-link").removeClass("active");
    $(this).addClass("active");

    $(".cry-page").removeClass("active");
    const page = $(this).data("page");
    $("#" + page).addClass("active");


  });


  function getJson(url) {

    return new Promise((resolve, reject) => {
      $.ajax({
        url,
        success: data => resolve(data),
        error: err => reject(err.statusText)
      })
    });

  }


  loadAll();
  async function loadAll() {

    try {

      const coinsArr = await getJson("https://api.coingecko.com/api/v3/coins/markets?order=market_cap_desc&vs_currency=usd");
      displayCoins(coinsArr);

    } catch (err) {

      alert(err.message);

    }


  }



  // onload display Coins
  function displayCoins(coins) {

    let content = "";

    for (const coin of coins) {

      content += getCoinsHtml(coin);
    }

    $("#cardContainer").html(content);

  }



  //display coins dynamic 
  function getCoinsHtml(coin) {

    return `

    <div class="col">
 
        <div class="card card-body card-body-css">
 
          <div id="switch" class="card-header bg-transparent border-dark">
 
              <h5 class="card-title ">${coin.symbol.toUpperCase()}</h5>
 
              <div class="form-check form-switch">

                <input class="form-check-input input-css" type="checkbox" role="switch" id="${coin.id}" data-inputid="${coin.id}" data-checkbox="${coin.symbol.toUpperCase()}">
                <label class="form-check-label" for="flexSwitchCheckDefault"></label>

              </div>
 
          </div>

          <p class="card-text">${coin.name}</p>

          <p class="d-inline-flex">
 
           <button data-infobtnid="${coin.id}" class="btn btn-primary" type="button" data-bs-toggle="collapse"
             data-bs-target="#m${coin.id}" aria-expanded="false" aria-controls="collapseExample">
             More Info
           </button>
 
          </p>


          <div class="collapse loader_wrap" id="m${coin.id}"> 
             
             <span class="loader"></span> 
            
          </div>
 
        </div>
 
    </div>

          `;

  }


  let globalCoinsArr = new Map();

  // onclick More Info Button
  $(document).on("click", "button[data-infobtnid]", async function () {

    const id = $(this).data("infobtnid");

    if (globalCoinsArr.has(id)) {
      const coinObj = globalCoinsArr.get(id);
      const currenTime = Date.now();
      const time = coinObj.timeStamp;
      const coinObjData = coinObj.coinsObj;

      if ((currenTime - time) < (1000 * 120)) {

        displayMoreInfo(coinObjData);

        console.log("global");
        return;

      }

    }

    try {

      const id = $(this).data("infobtnid");
      const coinsObj = await getJson("https://api.coingecko.com/api/v3/coins/" + id);
      displayMoreInfo(coinsObj);
      console.log(coinsObj);

      globalCoinsArr.set(id, {
        timeStamp: Date.now(),
        coinsObj
      });

      console.log("api");

    } catch (err) {

      alert(err.message);

    }

  });



  // display More info dynamic
  function displayMoreInfo(coinsObj) {

    let content = `

    <div class="card card-body border-warning infoDiv">

    <img src="${coinsObj.image.thumb}" width="30">
    <p>USD: ${coinsObj.market_data.current_price.usd} &dollar;</p>
    <p>EUR: ${coinsObj.market_data.current_price.eur} &euro;</p>
    <p>ILS: ${coinsObj.market_data.current_price.ils} &#8362;</p>

    </div>
    
    `;

    $(`#m${coinsObj.id}`).html(content);

  }



  // on search
  $("#searchBtn").on("click", async function () {


    $(".nav-link").removeClass("active");
    $(`a[data-page="coins"]`).addClass("active");

    $(".cry-page").removeClass("active");
    const page = $(`a[data-page="coins"]`).data("page");
    $("#" + page).addClass("active");


    const searchText = $("#searchBox").val();

    if (searchText === "") {

      $("#searchBox").css({ "border": "5px solid black" });
      $("#searchBox").attr("placeholder", "Please Enter Something");
      return;
    }

    try {

      const coinObj = await getJson("https://api.coingecko.com/api/v3/search?query=" + searchText);
      const coinsArr = coinObj.coins;

      if (coinsArr.length === 0) {

        $("#cardContainer").hide();
        $(".parallax").hide();
        $("#noInfo").show();
        $("#searchBox").val("");


      } else {

        $(".parallax").hide();
        $("#noInfo").hide();
        $("#cardContainer").show();

      }

      displayCoins(coinsArr);


    } catch (err) {

      alert(err.message);

    }

    $("#searchBox").css({ "border": "" });
    $("#searchBox").attr("placeholder", "Search");
    $("#searchBox").val("");


  });



  let selectedCoins = [];
  let coinToSwap = null;
  let lastCoinId;

  // switch + modal
  $(document).on("change", "input.form-check-input", function () {


    let targetId = $(this).data("inputid");

    if ($(this).is(":checked")) {


      if (selectedCoins.length < 5) {
        selectedCoins.push(targetId);


      } else if (selectedCoins.length === 5) {

        displayModal(selectedCoins);
        $("#listModal").modal("show");
        coinToSwap = targetId;
        lastCoinId = targetId;
      }



    } else {

      let index = selectedCoins.indexOf(targetId);

      if (index !== -1) {

        selectedCoins.splice(index, 1);

      }

      if (coinToSwap) {

        selectedCoins.push(coinToSwap);
        coinToSwap = null;

      }

    }

    displayModal(selectedCoins);

  });




  function displayModal(checked) {

    let checkedContent = `<ul class="list-group">`;

    for (const id of checked) {
      const sym = $(`.input-css[data-inputid=${id}]`).data("checkbox");

      checkedContent += getCheckedItemsHtml(id, sym);
    }

    checkedContent += `</ul>`;

    $("div.modal-body").html(checkedContent);

  }



  function getCheckedItemsHtml(id, sym) {

    return `
      <li class="list-group-item">
        <input class="form-check-input modal-input input-css" data-checkbox=${sym} data-inputid=${id} type="checkbox" value="" aria-label="..." checked>
        ${sym}
      </li>
    `;
  }



  $(document).on("change", "input.form-check-input.modal-input", function () {

    const id = $(this).data("inputid");

    $(`input.input-css[id=${id}]`).prop("checked", false);

    $("#listModal").modal("hide");


  });


  $(document).on("click", ".close-me", function () {

    $(`input.input-css[data-inputid=${lastCoinId}]`).prop("checked", false);

  });




  $(document).on("click", `a[data-page="about"]`, function () {

    $(".parallax").hide();
    $("#noInfo").hide();


    $(".aboutContainer").html(`

      <div id="aboutDiv">
      
        <img src="assets/images/Bitcoin-PNG-Background.png" width="140" height="140" alt=""> <br/><br/>

        <div class="aboutContent">
        
              <h1>About Us</h1>

              <p>My name is Marwa Nazi ,Welcome to my journey as a frontend developer at John Bryce! Here, I'm diving into the dynamic world of web development, learning the art of crafting captivating user interfaces and bringing websites to life..</p> <br/>

             <p>
               Welcome to our comprehensive currency hub, where financial enthusiasts and curious minds converge to explore the fascinating world of currencies! Our website is your passport to a wealth of information, insights, and resources dedicated to understanding the intricate dance of global money.
               Discover up-to-date exchange rates, historical trends, and in-depth analyses of major and emerging currencies from around the globe. Whether you're a seasoned investor, a traveler planning your next adventure, or simply someone intrigued by the dynamics of money
                Navigate through our user-friendly interface to explore currency converters, market news, and educational content that demystifies the complex factors shaping the value of money. From the mighty dollar to the rising stars of the financial world, we've got you covered with accurate data and captivating insights.
                Join us on this engaging journey through the fascinating realm of currencies. Our website is more than just numbers; it's a gateway to understanding the pulse of the global economy. Start exploring, and let the world of currencies unfold before you!
              </p><br>

             <p>For more information please contact me to <a href="mailto:marwa.nazy@hotmail.com">marwa.nazy@hotmail.com</a> </p>
           

        </div>

        
        </div>
        
       
    `);

  });


});

