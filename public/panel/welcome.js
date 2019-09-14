setTimeout(() => {
  $.get( "https://dt-extractor.glitch.me/config/welcome", function( data ) { 
    document.getElementById("a").checked = data[0];
    document.getElementById("b").value = data[1];
    document.getElementById("c").value = data[2];
    document.getElementById("d").checked = data[3]
  }); 
});

function save() {
  $.post( "https://dt-extractor.glitch.me/config/join", {"a":[document.getElementById("a").checked,
                                                         document.getElementById("b").value,
                                                         document.getElementById("c").value,
                                                         document.getElementById("d").checked]}, function( data ) { if(data == true) { alert("Changes applied.");
  }}); 
}