setTimeout(() => {
  $.get( "https://dt-extractor.glitch.me/config/join", function( data ) { 
    document.getElementById("a").checked = data[0];
    document.getElementById("b").value = data[1];
    document.getElementById("c").checked = data[2];
  }); 
});

function save() {
  $.post( "https://dt-extractor.glitch.me/config/join", {"a":[document.getElementById("a").checked,
                                                         document.getElementById("b").value,
                                                         document.getElementById("c").checked]}, function( data ) { if(data == true) { alert("Changes applied.");
  }}); 
}