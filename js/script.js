$(document).ready(function() {
  document.body.onload = form();
});
//Function to retreive the data from the API.

function getPlan(station, results){
  //console.log("updated");
  today = new Date();
  today.setHours(today.getHours());
  date = today.toISOString();

  data1 = `<?xml version="1.0" encoding="UTF-8"?>
<Trias version="1.1" xmlns="http://www.vdv.de/trias" xmlns:siri="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ServiceRequest>
      <siri:RequestTimestamp>`

  data2 = `</siri:RequestTimestamp>
      <siri:RequestorRef>API-Explorer</siri:RequestorRef>
      <RequestPayload>
          <StopEventRequest>
              <Location>
                  <LocationRef>
                      <StopPointRef>`;
  data3 = `</StopPointRef>
</LocationRef>
<DepArrTime>`;

  data4 = `</DepArrTime>
</Location>
<Params>
  <NumberOfResults>`;

  data5 = `</NumberOfResults>
  <StopEventType>departure</StopEventType>
  <IncludePreviousCalls>false</IncludePreviousCalls>
  <IncludeOnwardCalls>false</IncludeOnwardCalls>
  <IncludeRealtimeData>true</IncludeRealtimeData>
</Params>
</StopEventRequest>
</RequestPayload>
</ServiceRequest>
</Trias>`

dataAll = data1 + date + data2 + station + data3 + date + data4 + results + data5;

  $.ajax({

    //Create the request to retreive the data.

    beforeSend: function (xhr) {
      xhr.setRequestHeader ("Authorization", "Bearer 57c5dbbbf1fe4d0001000018144174137d0343a9970c60d6d8119903");
    },
    url: "https://api.opentransportdata.swiss/trias2020",
    data: dataAll,
    type: 'POST',
    contentType: "text/xml",
    dataType: "text",
    accept: "*/*",

    success: function(xml) {

      //Parse the data and convert it to json.

      parser = new DOMParser();
      xmlDoc = parser.parseFromString(xml,"text/xml");
      json =  xml2json(xmlDoc, "\t");
      parsedJson = JSON.parse(json);

      //List the data in a table.

      let table = document.getElementById("list");
      while (table.hasChildNodes()) {
        table.removeChild(table.firstChild);
        }

        let thead = document.createElement("thead");
        thead.appendChild(document.createElement("th")).appendChild(document.createTextNode("Linie"));
        thead.appendChild(document.createElement("th")).appendChild(document.createTextNode("Ziel"));
        thead.appendChild(document.createElement("th")).appendChild(document.createTextNode("Gleis"));
        thead.appendChild(document.createElement("th")).appendChild(document.createTextNode("Abfahrt"));
        thead.appendChild(document.createElement("th")).appendChild(document.createTextNode("Hinweis"));

        table.appendChild(thead);
        if(typeof parsedJson["trias:Trias"]["trias:ServiceDelivery"]["trias:DeliveryPayload"]["trias:StopEventResponse"]["trias:StopEventResult"] !== "undefined"){
          for (var i = 0; i < parsedJson["trias:Trias"]["trias:ServiceDelivery"]["trias:DeliveryPayload"]["trias:StopEventResponse"]["trias:StopEventResult"].length; i++) {
            haltestelle =  parsedJson["trias:Trias"]["trias:ServiceDelivery"]["trias:DeliveryPayload"]["trias:StopEventResponse"]["trias:StopEventResult"][i]["trias:StopEvent"]["trias:Service"]["trias:DestinationText"]["trias:Text"];
            linie = parsedJson["trias:Trias"]["trias:ServiceDelivery"]["trias:DeliveryPayload"]["trias:StopEventResponse"]["trias:StopEventResult"][i]["trias:StopEvent"]["trias:Service"]["trias:PublishedLineName"]["trias:Text"];
            abfahrt = parsedJson["trias:Trias"]["trias:ServiceDelivery"]["trias:DeliveryPayload"]["trias:StopEventResponse"]["trias:StopEventResult"][i]["trias:StopEvent"]["trias:ThisCall"]["trias:CallAtStop"]["trias:ServiceDeparture"]["trias:TimetabledTime"];
            //console.log("1: " + abfahrt);
            try {
              kante = parsedJson["trias:Trias"]["trias:ServiceDelivery"]["trias:DeliveryPayload"]["trias:StopEventResponse"]["trias:StopEventResult"][i]["trias:StopEvent"]["trias:ThisCall"]["trias:CallAtStop"]["trias:PlannedBay"]["trias:Text"];
            }
            catch {
              kante = "-";
            }

            abfahrt1 = new Date();
            abfahrt1.setTime(Date.parse( abfahrt ));
            abfahrt = abfahrt1.toLocaleTimeString('de-CH').substring(0, 5);

            if(typeof parsedJson["trias:Trias"]["trias:ServiceDelivery"]["trias:DeliveryPayload"]["trias:StopEventResponse"]["trias:StopEventResult"][i]["trias:StopEvent"]["trias:ThisCall"]["trias:CallAtStop"]["trias:ServiceDeparture"]["trias:EstimatedTime"] != "undefined"){
              try {
                abfahrt2 = parsedJson["trias:Trias"]["trias:ServiceDelivery"]["trias:DeliveryPayload"]["trias:StopEventResponse"]["trias:StopEventResult"][i]["trias:StopEvent"]["trias:ThisCall"]["trias:CallAtStop"]["trias:ServiceDeparture"]["trias:EstimatedTime"];

                abfahrt3 = new Date();
                abfahrt3.setTime(Date.parse( abfahrt2 ));
                var t1 = " ";
                var t2 = " ";
                if(abfahrt3.getMinutes().toString() == "0"){
                  t2 = 60;
                }

                if(abfahrt1.getMinutes().toString() == "0"){
                  t1 = 60
                }
                if(abfahrt3.getMinutes() < 10) {
                  t2 = (0 + abfahrt3.getMinutes()).slice(-2);
                }
                if(abfahrt1.getMinutes() < 10) {
                  t1 = (0 + abfahrt3.getMinutes()).slice(-2);
                }
                if((abfahrt3.getMinutes() - abfahrt1.getMinutes()) != 0) {
                  hinweis = ("+ " + (abfahrt3.getMinutes() - abfahrt1.getMinutes()) + "'");
                }
                else {
                  hinweis = " ";
                }

                //console.log(abfahrt3.getMinutes());
                //console.log((abfahrt1.toLocaleTimeString('de-CH').substring(0, 5)) + " ;; " + (abfahrt3.toLocaleTimeString('de-CH').substring(0, 5)));
                //console.log(abfahrt1.getHours() + ":" + abfahrt1.getMinutes() + " ;; " + abfahrt3.getHours() + ":" + abfahrt3.getMinutes());
                //console.log(abfahrt3.getMinutes().toString());
              }
              catch {
                hinweis = " ";
              }
            }
            else {
              hinweis = " ";
            }

            let row = table.insertRow(-1)

            let cell = row.insertCell(-1)
            cell.innerHTML = linie;
            cell.id = "linie";

            cell = row.insertCell(-1)
            cell.innerHTML = haltestelle;

            cell = row.insertCell(-1)
            cell.innerHTML = kante;
            cell.style = "text-align: center";

            cell = row.insertCell(-1)
            cell.innerHTML = abfahrt;

            cell = row.insertCell(-1)
            cell.innerHTML = hinweis;
            cell.style = "color: yellow";
          }
        }
        else {
          let title = document.getElementById('bahnhof');
          title.innerHTML = "Keine Daten gefunden für " + title.innerHTML;
        }

    },
    error : function (xhr, ajaxOptions, thrownError){
        alert(xhr.status);
        alert(thrownError);
    }
});
}

//Create the form to Input the trainstation, interval and amount of results.

function form() {
  var form = document.createElement("form");
  form.className = "modal";
  form.id = "form";
  form.action = "index.html";

  var br = document.createElement("br");

  var div1 = document.createElement("div");
  var div2 = document.createElement("div");
  var div3 = document.createElement("div");
  var div4 = document.createElement("div");
  var divRange = document.createElement("div");

  var stationInput = document.createElement("input");
  stationInput.type = "text";
  stationInput.id = "station";
  stationInput.name = "station";
  stationInput.placeholder = "Bahnhof";


  var intervalText = document.createTextNode("Intervall:")

  var intervalLabel = document.createElement("label");
  intervalLabel.setAttribute("for","interval");
  intervalLabel.innerHTML = "Intervall";

  var intervalInput = document.createElement("input")
  intervalInput.type = "range";
  intervalInput.id = "interval";
  intervalInput.name = "intervall";
  intervalInput.min = "5";
  intervalInput.max = "600";

  var intervalAmount = document.createElement("label");
  intervalAmount.setAttribute("for","interval");
  intervalAmount.id = "amount";

  var resultInput = document.createElement("input");
  resultInput.type = "number";
  resultInput.id = "results";
  resultInput.name = "results";
  resultInput.min = "5";
  resultInput.max = "20";

  var resultLabel = document.createElement("label");
  resultLabel.setAttribute("for", "results");
  resultLabel.innerHTML = "Anzahl Resultate";

  var submitButton = document.createElement("input");
  submitButton.type = "submit";
  submitButton.value = "Submit";
  submitButton.setAttribute("rel", "modal:close");


  div1.appendChild(stationInput);
  div1.appendChild(br);
  div2.appendChild(intervalLabel);
  divRange.appendChild(intervalInput);
  divRange.appendChild(intervalAmount);
  div2.appendChild(divRange);
  div3.appendChild(resultLabel);
  div3.appendChild(br);
  div3.appendChild(resultInput);

  div4.appendChild(submitButton);
  form.appendChild(div1);
  form.appendChild(div2);
  form.appendChild(div3);
  form.appendChild(div4);
  document.body.appendChild(form);

  //Action listeners to check the input.

  $('input[type=range]').on('change', function () {
    $('#amount').text( $(this).val() + " Sekunden");
  });

  $("#form").submit(function( event ) {
    var formData = ($('form').serializeArray());
    var contain = false;

    for (var i = 0; i < bahnhoefe.length; i++) {
      if(bahnhoefe[i]["Station"].includes(formData[0]["value"] + "$")) {
        $('#bahnhof').text(
          formData[0]["value"]
          );

        contain = true;
        $.modal.close();
        break;
      }
    }
    if(contain == true){
      displayData(bahnhoefe[i]["StationID"], (formData[1]["value"]), formData[2]["value"]);
    }
    var notFound = document.createElement("label");
    notFound.setAttribute("for", "station");
    notFound.innerHTML = "";
    form.appendChild(br);
    form.appendChild(br);
    form.appendChild(notFound);
    if(contain == false) {
          notFound.innerHTML = "Bahnhof nicht gefunden";
    }

    event.preventDefault();
  });

  $('#form').modal();
}

//Display the data with the params from the form.
function displayData(bahnhof, interval, results){
  getPlan(bahnhof, results);
  setInterval(function() {getPlan(bahnhof, results)}, interval * 1000);

}
