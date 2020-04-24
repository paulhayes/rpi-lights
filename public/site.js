
	var container = document.querySelector(".container");
    var selectNode = document.getElementById("effectsDropdown");
    //var effectTypesDropdown = document.getElementById("effectTypesDropdown"); 
    var effectFields = document.getElementById("effectFields"); 
    var createEffectBtn = document.getElementById("createEffect");
    var effectTypes; 
  
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.responseText);
        var options = data.effects;
        options.forEach(function(option, index){
          var op = new Option();
        op.value = index;
        op.text = option;
        selectNode.options.add(op);
        });
        let selectedEffectIndex = parseInt(data.selected);
        if(selectedEffectIndex>=0){
          selectNode.value = data.selected;
          selectNode.onchange = selectEffect;
          populateEffect(selectedEffectIndex);
        }
      }
    };
    xhttp.open("GET", "/effects", true);
    xhttp.send();

    const makeHTML = function(str,parent){
      const html = new DOMParser().parseFromString(str,'text/html');
      return html.body.firstChild;
    }
  
    const selectEffect = async function(event){
      let effectIndex = event.target.value;
      const response = await fetch(`/effects/select/${effectIndex}`);
      
      populateEffect(effectIndex);
    }
  
    const clearEffectFields = function(){
      while(effectFields.childElementCount>0){
        effectFields.removeChild(effectFields.lastElementChild)
      }
    }

    const createDropdownInput = function(effectIndex,props){
      const row = makeHTML(`
        <div class="row">
          <div class="four columns"><label for="${props.id}">${props.label}</label></div>
          <div class="eight columns">
            <select>
              ${props.options.map((opt)=>`<option value="${opt[0]}">${opt[1]}</option>`)}
            </select>
          </div>
        </div>
      `);
      const selectInput = row.querySelector('select');
      selectInput.onchange = function(){
        sendProperty(effectIndex,props.id,selectInput.value);
      };

      return row;
    }

    const createGenericInput = function(effectIndex,props){
      const row = makeHTML(`
        <div class="row">
          <div class="four columns"><label for="${props.id}">${props.label}</label></div>
          <div class="eight columns"><input type="${props.type}" value="${props.value}"></div>
        </div>
      `);
      const input = row.querySelector("input");
      input.oninput = function(){
        let value = input.value;
        if(props.type==='number' || props.type==='range'){
          value = parseFloat(value);
        }
        sendProperty( effectIndex, props.id, input.value );
      }

      return row;
    }

    const createColorInput = function(effectIndex,props){
      const row = makeHTML(`
        <div class="row">
          <div class="four columns"><label for="${props.id}">${props.label}</label></div>
          <div class="three columns">RGB <input type="color" name="${props.id}"></div>
          <div class="five columns">W<input type="range" min="0" max="1" step="0.01"></div>         
        </div>`);
        const colorInput = row.querySelector("input[type=color]");
        const whiteInput = row.querySelector("input[type=range]");
        let onInput = function(){
          const hexColor = colorInput.value;
          //console.log('input',colorInput.value.substr(1,2),whiteInput.value);
          let bytePositions = [1,3,5];
          let colorStr = bytePositions.map((p)=>(parseInt(hexColor.substr(p,2),16)/255).toFixed(2) ).join(',');          
          colorStr += ','+parseFloat(whiteInput.value).toFixed(2);
          sendProperty( effectIndex, props.id, colorStr);
        }
        whiteInput.oninput = onInput;
        colorInput.oninput = onInput;

        return row;
    }
  
    const sendProperty = async function(effectIndex,property,value){
      const data = {};
      if(property==='name'){
        selectNode.childNodes[effectIndex].innerText = value;
      }
      data[property] = value;
      const response = await fetch(`/effects/settings/${effectIndex}`,{
        method:"PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body:JSON.stringify(data)
      });
      if( response.status !== 200 ){
        console.warn(response.status,response.error);
        return;
      }
      const responseData = await response.json();
      console.log(responseData.status);
      
    }
  
    const populateEffect = async function(effectIndex){
      //new URLSearchParams({effectIndex}).toString()
      const response = await fetch(`/effects/settings/${effectIndex}`);
        if(!response.ok){
          console.error(response.status);
          return false;
        }

      const data = await response.json();
    
      if(!data)
        return;
      clearEffectFields();
      data.forEach((effectProps,i)=>{
        console.log(effectProps,i);    
        let inputContainer = document.createElement("div");
        inputContainer.className = "row";
        
        let label = document.createElement("label");
        label.innerText = effectProps.label;
        
        if(effectProps.type==='select'){
          inputContainer.appendChild( createDropdownInput(effectIndex,effectProps) );
          /*
          let selectInput = document.createElement("select");
          
          for( let option of effectProps.options ){
            let optionElement = document.createElement("option");
            console.log(option);
            optionElement.innerText = option[1];
            optionElement.value = option[0];
            selectInput.appendChild(optionElement);
          }
          inputContainer.appendChild(label);
          inputContainer.appendChild(selectInput);
          selectInput.onchange = function(){
            sendProperty(effectIndex,effectProps.id,selectInput.value);
          };
          */
        }
        else if(effectProps.type==='color'){
          inputContainer.appendChild( createColorInput(effectIndex,effectProps) );            
          /*
          //create multiple elements
          let colorInput = document.createElement("input");
          let whiteInput = document.createElement("input");
          let rgb = "#"+effectProps.value.split(",").slice(0,3).map((g)=>Math.round(parseFloat(g)*0xff).toString(16)).map((d)=>"00".slice(0,2-d.length)+d ).join("");
          let w = effectProps.value.split(",").slice(-1);
          console.log("color data:",effectProps.value,rgb,w);
          whiteInput.type = "range";
          whiteInput.min = 0;
          whiteInput.max = 1;
          whiteInput.step = 0.01;
          whiteInput.value = parseFloat(w);
          colorInput.value = rgb;
          colorInput.type = effectProps.type;
          
          let onInput = function(){
            console.log('input',colorInput.value.substr(1,2),whiteInput.value);
            let bytePositions = [1,3,5];
            let colorStr = bytePositions.map((p)=>(parseInt(colorInput.value.substr(p,2),16)/255).toFixed(2) ).join(',');
            
            colorStr += ','+parseFloat(whiteInput.value).toFixed(2);
            sendProperty( effectIndex, effectProps.id, colorStr);
          }
          whiteInput.oninput = onInput;
          colorInput.oninput = onInput;
          inputContainer.appendChild(label);
          inputContainer.appendChild(colorInput);
          inputContainer.appendChild(whiteInput);
          */
        }
        else {
          inputContainer.appendChild( createGenericInput(effectIndex,effectProps) );
          /*
          let input = document.createElement("input");
          input.value = effectProps.value;
          input.type = effectProps.type;
          
          input.onchange = function(){
          //console.log('change');
          }
          input.oninput = function(){
            console.log('input');
            let value = input.value;
            if(effectProps.type==='number' || effectProps.type==='range'){
              value = parseFloat(value);
            }
            sendProperty( effectIndex, effectProps.id, input.value );
          }
          inputContainer.appendChild(label);
          inputContainer.appendChild(input);
          */
        }
        effectFields.appendChild(inputContainer);
      });
      
    }
  
    createEffectBtn.addEventListener('click',async function(e){
      const response = await fetch("/effects/add",{
        method:"PUT",
      });
      const data = await response.json();
      console.log(data);
      populateEffect(data.effectIndex);
    })
    /*
    fetch("/effect_types").then((response)=>{
      if(!response.ok){
        console.error(response.status);
        return;
      }
      return response.json()
    }).then(function(data){
      if(!data)
        return;
      console.log(data);
      effectTypes = data;
      Object.keys( effectTypes ).forEach((effectName,i)=>{
        console.log(effectName,i);
        let option = document.createElement("option");
        option.value = i;
        option.innerText = effectName;
        effectTypesDropdown.appendChild(option);
      });
      
    });
    */
  
    
  
    function encodeQueryData(data) {
     let ret = [];
     for (let d in data)
       ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
     return ret.join('&');
  }
  