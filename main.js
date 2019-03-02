// dictioanry githubusercontent.com/matthewreagan/WebstersEnglishDictionary/master/dictionary.json
//https://raw.githubusercontent.com/matthewreagan/WebstersEnglishDictionary/master/dictionary_alpha_arrays.json

$(document).ready(function () {
  var dataController = (function () { // Model
    var editWordList;// stores the spelling list for editing
    var textWordList;// stored the spelling list for game purposes
    var activeTab = true;//used to see which tab is active
    var totalWords;//stored the total number of words
    var wordCount = 0; // how many words have been spelled
    var rightScore = 0; // how many words where spelled correctly
    var wrongScore = 0; // how many words where spelled incorrectly

    return {
      setActiveTab: function (bool) {
        //used to set the active tab so that the spelling list data is set correctly
        activeTab = bool;
      },
      setWordListData: function (data) {
        //used to set the word list data
        if (activeTab) {
          textWordList = data;
          totalWords = textWordList.words.length; // gets the number of words to know how long the game will run for
        } else {
          editWordList = data;
        }
      },
      getEditWordList: function () {//used to pass the word list data for editing of a spelling list
        return editWordList;
      },
      getTextWordList: function () {//used to pass the word list data for the spelling game
        return textWordList;
      },
      getWord: function () {//used to get the current word
        return textWordList.words[wordCount].word;
      },
      getExampleSentence: function () {//used ot get the example sentence of the current word
        return textWordList.words[wordCount].exampleSentence;
      },
      getDefinition: function () {//used to get the definition of the current word
        return textWordList.words[wordCount].definition;
      },
      updateScore: function (right) {
        //used to update the right and wrong scores of the spelling game and the word counter
        if (right) {//based on if the user go the question right or wrong the selected score will increment
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
      getFinalScore: function () {//gets the final score of the spelling game
        return {
          rightScore: rightScore,
          totalWords: totalWords
        };
      },
      gameFinished: function () { //compares the number of words spelled to how many words left to spell
        console.log(totalWords + " and " + wordCount);
        return (totalWords > wordCount);
      },
      resetData: function () {//used to reset the data of the spelling game
        wordCount = 0;
        rightScore = 0;
        wrongScore = 0;
      }
    };
  })();

  var uiController = (function () { //View
    var wordHTML;
    var uiElems = { //stores all the classes and ids of all the elements
      tab1Label: $("#tab1Label"),
      tab2Label: $("#tab2Label"),
      txtScore: $("#txtScore"),
      txtRightScore: "#rightScore", // displays correct answers
      txtWrongScore: "#wrongScore", // displays incorrect answers
      spellingInput: $("#spellingInput"),
      txtSpelledWord: $("#txtSpelledWord"),
      spellingGameControls: $("#spellingGameControls"),
      btnStart: $("#btnStart"),
      btnRestart: $("#btnRestart"),
      btnLoadAnother: $("#btnLoadAnother"),
      txtLoadWordList: $("#txtLoadWordList"),
      btnLoadWords: $("#btnLoadWords"),
      btnCheck: $("#btnCheck"),
      btnRepeat: $("#btnRepeat"),
      btnSentence: $("#btnSentence"),
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
      txtNoWordsError: $("#txtNoWordsError"),
      txtWordError: ".txtWordError",
      txtExampleSentenceError: ".txtExampleSentenceError",
      txtDefinitionError: ".txtDefinitionError"
    };

    var setupHTML = function () {
      wordHTML = '<li class="wordContainer col-md-6 col-sm-12" draggable="true" ondragstart="drag(event)">';
      wordHTML += '<button class="btn btn-danger btnDeleteWord">Delete Word</button>';
      wordHTML += '<label for="txtWord">Word</label>';
      wordHTML += '<input type="text" class="form-control txtWord" placeholder="Word">';
      wordHTML += '<p class="txtWordError" class="error"> An option has been left blank</p>';
      wordHTML += '<label for="txtExampleSentence">Example Sentence</label>';
      wordHTML += '<input type="text" class="form-control txtExampleSentence" placeholder="Example Sentence">';
      wordHTML += '<p class="txtExampleSentenceError" class="error"> An option has been left blank</p>';
      wordHTML += '<label for="txtDefinition">Definition</label>';
      wordHTML += '<input type="text" class="form-control txtDefinition" placeholder="Word Definition">';
      wordHTML += '<p class="txtDefinitionError" class="error"> An option has been left blank</p>';
      wordHTML += '</li>';
    };

    setupHTML();

    return {
      getUIElems: function () {//gives access to the selectors dictionary 
        return uiElems;
      },
      setUpSpellingGameUI: function () {//used to reset the scoreboard 
        uiElems.txtScore.html('Scores : <span id="rightScore">0</span> ' +
          '<span id="wrongScore">0</span>');
        uiElems.spellingGameControls.show();
      },
      displayFinalScore: function (scores) {
        //used to display the final score of the spelling test
        uiElems.txtScore.text("You got " + scores.rightScore + " out of " + scores.totalWords);
      },
      addWord: function () {//used to add UI elems to enter another word for the current word list
        $(wordHTML).appendTo(uiElems.wordList);
       uiElems.txtNoWordsError.hide();
      },
      clearSpelling: function () {//used to clear the spelling textbox
        uiElems.txtSpelledWord.val("");
      },
      deleteWord: function (that, displayNoWordsError) {
        //used to delete the UI elems for a word in the spelling list builder 
        $(that).parent().remove();
        displayNoWordsError();
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
      getWordHTML: function () {//gets the html elements for a words UI elems
        return wordHTML;
      },
      scoreUpdate: function (scores) {// used to update the score board
        $(uiElems.txtRightScore).text(scores.rightScore);
        $(uiElems.txtWrongScore).text(scores.wrongScore);
      }
    };
  })();


  var controller = (function (dataCtrl, UICtrl) {//controller
    var uiElems = UICtrl.getUIElems();// list of all selectors to reduce erroneous input
    var events = function () { // store all the events
      uiElems.tab1Label.on("click", function () { // changes the active tab so that the correct data structure is used
        dataCtrl.setActiveTab(true);
        console.log("spelling list");
      });

      uiElems.tab2Label.on("click", function () { // changes the active tab so that the correct data structure is used
        dataCtrl.setActiveTab(false);
        console.log("spelling game");
      });

      uiElems.btnLoadWords.on("change", function () { //event that sets off the spelling list getting process 
        getWordList();
        uiElems.btnStart.show();
        uiElems.txtLoadWordList.hide();
        uiElems.btnLoadWords.hide();
      });
      uiElems.btnStart.on("click", function () { //used to get a word from the data structure
        getWord();
        UICtrl.setUpSpellingGameUI();
        uiElems.btnStart.hide();
        uiElems.btnRestart.show();
        uiElems.btnLoadAnother.show();
        uiElems.spellingInput.css('display', 'flex');
      });
      uiElems.btnRestart.on("click", restartSpelling);//events that helps restart the spelling game
      uiElems.btnLoadAnother.on("click", loadAnotherSpellingTest);//event that help start another spelling test
      uiElems.btnCheck.on("click", checkSpelling); //used to check the spelling
      uiElems.btnRepeat.on("click", getWord); // gets the word from the data structure so that the user can hear it again

      uiElems.btnDefinition.on("click", function () { //used to trigger the 
        readOutLoud(dataCtrl.getDefinition());
      });

      uiElems.btnSentence.on("click", function () {
        //events that will trigger the current word to be said in a sentence 
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
      uiElems.wordList.on("click", uiElems.btnDeleteWord, function(){//event that triggers the deletion of word's word list UI elements
       UICtrl.deleteWord(this,displayNoWordsError); //start the process to remove a words ui elements
      
      });
      uiElems.txtWordListName.on("input", function () {
      //events that trigger validation to show error message when textbox are left blank.
        UICtrl.validateTxt("#txtWordListNameError", this);
      });

      uiElems.wordList.on("input", uiElems.txtWord, function (e) {
        //event used to help display an error when the user leaves the textbox blank
        UICtrl.validateTxt(".txtWordError", this);
      });

      uiElems.wordList.on("input", uiElems.txtExampleSentence, function (e) {
        //event used to help display an error when the user leaves the textbox blank
        UICtrl.validateTxt(".txtExampleSentenceError", this);
      });

      uiElems.wordList.on("input", uiElems.txtDefinition, function (e) {
        //event used to help display an error when the user leaves the textbox blank
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

    var getWordList = function (e) {//used to get the word list for the spelling game
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
          var con = $($(uiElems.wordContainer)[i]);//short form for word container
          con.find(uiElems.txtWord).val(w.word);
          con.find(uiElems.txtExampleSentence).val(w.exampleSentence);
          con.find(uiElems.txtDefinition).val(w.definition);
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

    var isWordListValid = function () {//used to presence check the input on the word-list builder page.
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
        UICtrl.validateTxt(".txtDefinitionError", this);
      }
      return isValid;
    };

    var isValidUIData = function (elem, error, isValid) {//used to shorten the validation for each textbox type in the word-list builder
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

    var displayNoWordsError = function () {
      //error message display function that will run when there are no words listed in the word list builder
      if ($(uiElems.wordContainer).length === 0) {
        uiElems.txtNoWordsError.show();
      }
    };

    var readWord = function () { // used to shorten event declarations
      readOutLoud(dataCtrl.getWord());
    };

    var checkSpelling = function () {//used to check user input and perform the majority of the spelling-game game-loop
      if (dataCtrl.gameFinished()) { //used to stop the user from checking spelling on a finished game
        if (uiElems.txtSpelledWord.val() !== "") { // check if blank
          if (uiElems.txtSpelledWord.val().toLowerCase() === dataCtrl.getWord().toLowerCase()) {
            UICtrl.scoreUpdate(dataCtrl.updateScore(true));
          } else {
            UICtrl.scoreUpdate(dataCtrl.updateScore(false));
          }
          if (!dataCtrl.gameFinished()) { // the game is over and the score will be displayed
            UICtrl.displayFinalScore(dataCtrl.getFinalScore());
          } else {
            readWord();
          }
        } else { // display error
          alert("You need to enter a spelling");
        }
      }
      UICtrl.clearSpelling();
    };

    var restartSpelling = function () {//used to restart the spelling game
      dataCtrl.resetData();
      UICtrl.setUpSpellingGameUI();
      readWord();
    };

    var loadAnotherSpellingTest = function () {//used to start another spelling game
      dataCtrl.resetData();
      UICtrl.setUpSpellingGameUI(); // TODO : clean this up 
      uiElems.btnLoadWords.val("");
      uiElems.spellingInput.hide();
      uiElems.spellingGameControls.hide();
      uiElems.btnRestart.hide();
      uiElems.btnLoadAnother.hide();
      uiElems.txtLoadWordList.show();
      uiElems.btnLoadWords.show();
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