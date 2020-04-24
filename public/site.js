
	var container = document.querySelector(".container");
    var selectNode = document.getElementById("effectsDropdown");
    var effectFields = document.getElementById("effectFields"); 
    var createEffectBtn = document.getElementById("createEffect");
    var effectTypes; 
  
    const updateEffectsList = async function(){
      const response = await fetch( "/effects");
      if(response.status!==200){
        console.warn(response.error);
        return;
      }
      const data = await response.json();
      while( selectNode.hasChildNodes() ){
        selectNode.removeChild(selectNode.lastElementChild);
      }
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

    const createButton = function(html,onClickCallback){
      const row = makeHTML(html);
      row.querySelector("button").onclick = onClickCallback;
      return row;
    }

    const createDeleteButton = function(effectIndex){
      return createButton(`
        <div class="row">
          <div class="two columns"><button>Delete</div>
          <div class="ten columns"></div>          
        </div>
      `,async ()=>{
        const response = await fetch(`/effects/${effectIndex}`,{method:"DELETE"});
        if(response.error){
          console.error(response.error);          
          return;
        }
        if(response.status!==200){
          console.warn(response.status);
          return;
        }
        const data = await response.json();
        updateEffectsList();
      });
    }

    const createColorInput = function(effectIndex,props){
      let rgb = "#"+props.value.split(",").slice(0,3).map((g)=>Math.round(parseFloat(g)*0xff).toString(16)).map((d)=>"00".slice(0,2-d.length)+d ).join("");
      let w = props.value.split(",").slice(-1);
          
      const row = makeHTML(`
        <div class="row">
          <div class="four columns"><label for="${props.id}">${props.label}</label></div>
          <div class="three columns">RGB <input type="color" name="${props.id}" value="${rgb}"></div>
          <div class="five columns">W<input type="range" min="0" max="1" step="0.01" value="${w}"></div>         
        </div>`);
        const colorInput = row.querySelector("input[type=color]");
        const whiteInput = row.querySelector("input[type=range]");
        let onInput = function(){
          const hexColor = colorInput.value;
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
         
        }
        else if(effectProps.type==='color'){
          inputContainer.appendChild( createColorInput(effectIndex,effectProps) );            
          
        }
        else {
          inputContainer.appendChild( createGenericInput(effectIndex,effectProps) );
          
        }

        effectFields.appendChild(inputContainer);
      });
      effectFields.appendChild( createDeleteButton(effectIndex) );

      
    }
  
    createEffectBtn.addEventListener('click',async function(e){
      const response = await fetch("/effects",{
        method:"POST",
      });
      const data = await response.json();
      console.log(data);
      updateEffectsList();
      populateEffect(data.effectIndex);
    })
   
  
  function encodeQueryData(data) {
     let ret = [];
     for (let d in data)
       ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
     return ret.join('&');
  }
  
  updateEffectsList();