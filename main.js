// dictioanry githubusercontent.com/matthewreagan/WebstersEnglishDictionary/master/dictionary.json
//https://raw.githubusercontent.com/matthewreagan/WebstersEnglishDictionary/master/dictionary_alpha_arrays.json

$(document).ready(function () {
  var dataController = (function () { // Model
    var editWordList;
    var textWordList;
    var activeTab = true;
    var totalWords;
    var wordCount = 0; // how many words have been spelled
    var rightScore = 0; // how many words where spelled correctly
    var wrongScore = 0; // how many words where spelled incorrectly

    return {
      setActiveTab: function (bool) {
        activeTab = bool;
      },
      setWordListData: function (data) {
        if (activeTab) {
          textWordList = data;
          console.log(textWordList);
          totalWords = textWordList.words.length;
        } else {
          editWordList = data;
        }
      },
      getEditWordList: function () {
        return editWordList;
      },
      getTextWordList: function () {
        return textWordList;
      },
      getWord: function () {
        return textWordList.words[wordCount].word;
      },
      getExampleSentence: function () {
        return textWordList.words[wordCount].exampleSentence;
      },
      getDefinition: function () {
        return textWordList.words[wordCount].definition;
      },
      updateScore: function (right) {
        if (right) {
          rightScore++;
        } else {
          wrongScore++;
        }
        wordCount++;
        return {
          rightScore: rightScore,
          wrongScore: wrongScore
        };
      },
      gameFinished: function () {//compares the number of words spelled to how many words left to spell
        console.log(totalWords + " and " + wordCount);
        return (totalWords > wordCount);
      },
      resetData: function () {
        wordCount = 0;
        rightScore = 0;
        wrongScore = 0;
      }
    };
  })();

  var uiController = (function () { //View
    var wordHTML;
    var uiElems = {
      tab1Label: $("#tab1Label"),
      tab2Label: $("#tab2Label"),
      textText: $("#textText"),
      txtScore: $("#txtScore"),
      txtRightScore: $("#rightScore"), // displays correct answers
      txtWrongScore: $("#wrongScore"), // displays incorrect answers
      txtSpelledWord: $("#txtSpelledWord"),
      btnStart: $("#btnStart"),
      btnLoadWords: $("#btnLoadWords"),
      btnCheck: $("#btnCheck"),
      btnRepeat: $("#btnRepeat"),
      btnSentece: $("#btnSentece"),
      btnDefinition: $("#btnDefinition"),
      btnSaveList: $("#btnSaveList"),
      wordList: $("#wordList"),
      btnEditWordList: $("#btnEditWordList"),
      btnAddWordUI: $("#btnAddWordUI"),
      wordContainer: ".wordContainer",
      btnDeleteWord: ".btnDeleteWord",
      txtWord: ".txtWord",
      txtExampleSentence: ".txtExampleSentence",
      txtDefinition: ".txtDefinition",
      txtWordListName: $("#txtWordListName"),
      txtWordError: ".txtWordError",
      txtExampleSentenceError: ".txtExampleSentenceError",
      txtDefinitionError: ".txtDefinitionError"
    };

    var setupHTML = function () {
      wordHTML = '<li class="wordContainer col-md-6 col-sm-12" draggable="true" ondragstart="drag(event)">';
      wordHTML += '<button class="btn btn-danger btnDeleteWord">Delete Word</button>';
      wordHTML += '<label for="txtWord">Word</label>';
      wordHTML += '<input type="text" class="form-control txtWord" placeholder="Word">';
      wordHTML += '<p class="txtWordError "> An option has been left blank</p>';
      wordHTML += '<label for="txtExampleSentence">Example Sentence</label>';
      wordHTML += '<input type="text" class="form-control txtExampleSentence" placeholder="Example Sentence">';
      wordHTML += '<p class="txtExampleSentenceError"> An option has been left blank</p>';
      wordHTML += '<label for="txtDefinition">Definition</label>';
      wordHTML += '<input type="text" class="form-control txtDefinition" placeholder="Word Definition">';
      wordHTML += '<p class="txtDefinitionError"> An option has been left blank</p>';
      wordHTML += '</li>';
    };

    setupHTML();

    return {
      getUIElems: function () {
        return uiElems;
      },displayFinalScore: function(){
        uiElems.txtScore.text("you got " + rightScore + " out of " + wordCount);
      },
      addWord: function () {
        $(wordHTML).appendTo(uiElems.wordList); //.hide();
        // $("#wordList li:last-child").fadeIn()
      },clearSpelling: function(){
        uiElems.txtSpelledWord.val("");
      },
      deleteWord: function () {
        $(this).parent().remove();
      },
      validateTxt: function (errorClass, that) {
        //used to inform the user if they left a textbox blank
        if ($(that).val() === "") {
          $(that).addClass("is-invalid");
          $(that).parent().find(errorClass).show();
        } else {
          $(that).removeClass("is-invalid");
          $(that).parent().find(errorClass).hide();
        }
      },
      getWordHTML: function () {
        return wordHTML;
      },
      scoreUpdate: function (rightScore, wrongScore) {
        uiElems.txtRightScore.text(rightScore);
        uiElems.txtWrongScore.text(wrongScore);
      }
    };
  })();


  var controller = (function (dataCtrl, UICtrl) {
    var uiElems = UICtrl.getUIElems();
    var events = function () { // store all the events
      uiElems.tab1Label.on("click", function () { // changes the active tab so that the correct data structure is used
        dataCtrl.setActiveTab(true);
        console.log("spelling list");
      });

      uiElems.tab2Label.on("click", function () { // changes the active tab so that the correct data structure is used
        dataCtrl.setActiveTab(false);
        console.log("spelling game");
      });

      uiElems.btnLoadWords.on("change", getWordList); //event that sets off the spelling list getting process 
      uiElems.btnStart.on("click", getWord); //used to get a word from the data structure
      uiElems.btnCheck.on("click", checkSpelling); //used to check the spelling
      uiElems.btnRepeat.on("click", getWord); // gets the word from the data structure so that the user can hear it again

      uiElems.btnDefinition.on("click", function () { //used to trigger the 
        readOutLoud(dataCtrl.getDefinition());
      });

      uiElems.btnSentece.on("click", function () {
        readOutLoud(dataCtrl.getExampleSentence());
      });

      uiElems.txtSpelledWord.bind("keyup", function (e) { //keyboard event used to start the spelling check
        e.preventDefault();
        if (e.keyCode === 13) { // Number 13 is the "Enter" key on the keyboard
          checkSpelling();
        }
      });

      uiElems.btnEditWordList.on("change", editWordList); //event used to start the word List getting process for editing the word
      uiElems.btnSaveList.on("click", saveList); //event that start the saving of the list
      uiElems.btnAddWordUI.on("click", UICtrl.addWord); //start the process of adding ui elements for a word in a spelling game list
      uiElems.wordList.on("click", uiElems.btnDeleteWord, UICtrl.deleteWord); //start the process to remove a words ui elements

      //events that trigger validation to show error message when textbox are left blank.
      uiElems.txtWordListName.on("input", function () {
        UICtrl.validateTxt("#txtWordListNameError", this);
      });

      uiElems.wordList.on("input", uiElems.txtWord, function (e) {
        UICtrl.validateTxt(".txtWordError", this);
      });

      uiElems.wordList.on("input", uiElems.txtExampleSentence, function (e) {
        UICtrl.validateTxt(".txtExampleSentenceError", this);
      });

      uiElems.wordList.on("input", uiElems.txtDefinition, function (e) {
        UICtrl.validateTxt(".txtDefinitionError", this);
      });
    };

    var getWord = function () { // used to reduce the amount of code in the event declarations
      readOutLoud(dataCtrl.getWord());
    };

    var onReaderLoad = function (e) {
      //used to get data from downloaded JSON file and save it into a data structure
      dataCtrl.setWordListData(JSON.parse(e.target.result));
    };

    var onChange = function (e) { //used to set up the download for the JSON file
      var file = event.target.files[0];
      var reader = new FileReader();
      reader.onload = onReaderLoad;
      reader.readAsText(file);
    };

    var getWordList = function (e) {
      onChange(e);
    };

    var editWordList = function (e) { //start the process to the spelling word list
      onChange(e);
      setTimeout(function () { // a timer used to give enough time for the JSON file to be read.
        let wordListData = dataCtrl.getEditWordList();
        console.log(wordListData);
        uiElems.txtWordListName.val(wordListData.title);
        uiElems.wordList.empty();
        wordListData.words.forEach(function (w, i) {
          uiElems.wordList.append(UICtrl.getWordHTML());
          var qCon = $($(uiElems.wordContainer)[i]);
          qCon.find(uiElems.txtWord).val(w.word);
          qCon.find(uiElems.txtExampleSentence).val(w.exampleSentence);
          qCon.find(uiElems.txtDefinition).val(w.definition);
        });
      }, 1000);
    };

    var download = function (content, fileName, contentType) { //used for file download 
      var a = document.createElement("a");
      var file = new Blob([content], {
        type: contentType
      });
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      console.log(a);
      a.click();
    };

    var saveList = function () { //saves the word list
      if (isWordListValid()) {
        var wordListData = getWordListData();
        var jsonData = JSON.stringify(wordListData);
        download(jsonData, wordListData.title + '.json', 'application/json');
      }
    };

    var getWordListData = function () { //used to collect the data that user entered
      var wordListData = {};
      wordListData.title = uiElems.txtWordListName.val();
      wordListData.words = [];
      var wordData = $(uiElems.wordContainer);
      wordData.each(function (i, w) { // i = index , w = word
        var textBoxData = $(w).find('input[type="text"]'); //making sure that no user plugins cause issues
        wordListData.words.push({
          "word": $(textBoxData[0]).val(),
          "exampleSentence": $(textBoxData[1]).val(),
          "definition": $(textBoxData[2]).val()
        });
      });
      return wordListData;
    };

    var isWordListValid = function () {
      var isValid = true; //if at any point this changes to false the game will not save
      if (uiElems.txtWordListName.val() === "") {
        isValid = false;
        UICtrl.validateTxt("#txtWordListNameError", uiElems.txtWordListName);
      }
      isValid = isValidUIData(uiElems.txtWord, ".txtWordError", isValid);
      isValid = isValidUIData(uiElems.txtExampleSentence, ".txtExampleSentenceError", isValid);
      isValid = isValidUIData(uiElems.txtDefinition, ".txtDefinitionError", isValid);
      if ($(uiElems.wordContainer).length === 0) {
        isValid = false;
      }
      return isValid;
    };

    var isValidUIData = function (elem, error, isValid) {
      var valid = true;
      $(elem).each(function () {
        if ($(this).val() === "") {
          UICtrl.validateTxt(error, this);
          valid = false;
        }
      });
      if (isValid) {
        return valid;
      }
      return isValid;
    };

    var checkSpelling = function () {
      if (dataCtrl.gameFinished()) {
        if (uiElems.txtSpelledWord.val() !== "") { // check if blank
          if (uiElems.txtSpelledWord.val().toLowerCase() === dataCtrl.getWord().toLowerCase()) {
            UICtrl.scoreUpdate(dataCtrl.updateScore(true));
          } else {
            UICtrl.scoreUpdate(dataCtrl.updateScore(false));
          }
          uiElems.textText.text(words[wordCount].word);
          readOutLoud(words[wordCount].word);
        } else { // display error
        }
      } else { // the game is over and the score will be displayed
        UICtrl.displayFinalScore();
      }
      UICtrl.clearSpelling();
    };

    var readOutLoud = function (message) { //Speech Synthesis 
      var speech = new SpeechSynthesisUtterance();
      // Set the text and voice attributes.
      speech.text = message;
      speech.volume = 1;
      speech.rate = 1;
      speech.pitch = 1;
      window.speechSynthesis.speak(speech);
    };

    return {
      init: function () {
        events();
      }
    };
  })(dataController, uiController);

  controller.init(); // <-- start
});