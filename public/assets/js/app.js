// Make sure we wait to attach our handlers until the DOM is fully loaded.
$(function () {

  $(".btn-scrape").on("click", function () {
    $.get("/scrape", (data) => {
      location.reload();
    });
  });

  $(".btn-clear").on("click", function () {
    $.ajax("/api/clear", {
      type: 'DELETE'
    }).then(
      function (result) {
        // Reload the page to get the updated list
        location.reload();
      }
    );
  });

  function updateSaved(id, bSaved) {
    $.ajax({
      method: "PUT",
      url: "/api/save/" + id,
      data: {
        issaved: bSaved
      }
    })
      .then(
        function (result) {
          // Reload the page to get the updated list
          location.reload();
        }
      );
  }

  $(".btn-save").on("click", function () {
    updateSaved($(this).attr("data-id"), true);
  });

  $(".btn-remove").on("click", function () {
    // remove from saved list.
    updateSaved($(this).attr("data-id"), false);

  });

  $(".btn-note").on("click", function () {
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + $(this).attr("data-id")
    })
      // With that done, add the note information to the page
      .then((data) => {
        // add note
        populateNote(data);

        // The title of the article
        $("#btn-note-save").attr("data-id", data._id);
        $("#note-title").text(data.title);
        $("#note-content").val("");
        $("#note-modal").modal("toggle");
      });
  });


  function populateNote(data) {
    var noteElem = $(".note-body");
    noteElem.empty();
    
    
    if (!data.notes || data.notes.length == 0) {
      
      $(".modal-footer p").text("Total Notes: 0");
      return;
    }
    for (let i = 0; i < data.notes.length; i++) {
      let newRow = $("<div>");
      newRow.addClass("row mb-1");

      let newCol = $("<div>");
      newCol.addClass("col-11");
      newCol.append("<p>" + data.notes[i].note + "</p>");
      newRow.append(newCol);

      newCol = $("<div>");
      newCol.addClass("col-1");
      let newButton = $("<button>");
      newButton.addClass("btn btn-danger btn-note-delete");
      newButton.attr("note-id", data.notes[i]._id);
      newButton.text("x");
      newCol.append(newButton);
      newRow.append(newCol);

      noteElem.append(newRow);

    }

    $(".modal-footer p").text("Total Notes: " + data.notes.length);

  }

  $("#btn-note-save").on("click", function () {
    if ($("#note-content").val().trim().length === 0) {
      return;
    }

    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      // Value taken from textarea
      data: { note: $("#note-content").val().trim() }
    })
      // With that done
      .then(data => {
        // Log the response
        console.log(data);
        // Empty the notes section
        populateNote(data);
      });

    // Also, remove the values entered in the input and textarea for note entry
    $("#note-content").val("");
  });

  function deleteNote() {
    var noteId = $(this).attr("note-id");
    var dataId = $("#btn-note-save").attr("data-id");
    console.log("fe => dataId: " + dataId + " - noteId: " + noteId);

    $.ajax("/api/delete/" + dataId + "/" + noteId, {
      type: 'DELETE'
    }).then(data => {
      // Reload the page to get the updated list
      // location.reload();
      populateNote(data);
    }
    );

  }
  
   $(document).on("click", ".btn-note-delete", deleteNote);

});