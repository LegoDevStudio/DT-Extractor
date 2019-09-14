setTimeout(() => {
  $.get( "https://dt-extractor.glitch.me/config/leave", function( data ) { 
    document.getElementById("a").checked = data[0];
    document.getElementById("b").value = data[1];
  }); 
});

function save() {
  $.post( "https://dt-extractor.glitch.me/config/leave", {"a":[document.getElementById("a").checked,
                                                          document.getElementById("b").value]}, function( data ) { if(data == true) { alert("Changes applied.");
  }}); 
}