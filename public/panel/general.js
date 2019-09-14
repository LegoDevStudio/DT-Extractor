setTimeout(() => {
  $.get( "https://dt-extractor.glitch.me/config/general", function( data ) { 
    document.getElementById("d").value = data[0];
    document.getElementById("e").value = data[1];
    document.getElementById("f").value = data[2];
    document.getElementById("g").value = data[3];
    document.getElementById("h").value = data[4];
  }); 
});

function save() {
  $.post( "https://dt-extractor.glitch.me/config/general", {"a":[document.getElementById("d").value,
                                                            document.getElementById("e").value,
                                                            document.getElementById("f").value,
                                                            document.getElementById("g").value,
                                                            document.getElementById("h").value]}, function( data ) { if(data == true) { alert("Changes applied.");
  }}); 
}