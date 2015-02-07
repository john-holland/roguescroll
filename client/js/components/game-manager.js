var _ = require("underscore");

module.exports = function() {
    return {
        _: {
            gameState: "not-started",
            levels: []
        },
        tags: [],
        messages: {
            init: function(entity, data) {
                entity.sendMessage("character-selection", { });
            },
            "character-selection": function(entity, data) {
                if (this.gameState !== "not-started") {
                    return;
                }
                
                this.gameState = "character-selection";
                
                entity.engine.findEntitiesByTag('hide-at-start').forEach(function(entity) {
                    entity.sendMessage("hide");
                });
                
                //pick your character!
                var characters = ["user", "woman", "girl", "old-man", "cat", "dog", "lamp"];
                characters = _.map(characters, function(character) {
                    var char = {
                        name: character,
                        icon: character,
                        skills: 10, //crit chance
                        brains: 10, //spell cost
                        brawn: 10, //attack damage
                        light: 10, //light amount,
                        level: 1
                    };
                    
                    switch (character) {
                        case "cat":
                            char.name = "April";
                            char.skills += 10;
                            char.brawn -= 5;
                            char.description = "A ca- aw jesus! I almost stepped on your tail, damnit cat!"
                            break;
                        case "dog":
                            char.name = "Sadie";
                            char.brawn += 10;
                            char.skills -= 5;
                            char.description = "A dog. Woof woof!"
                            break;
                        case "lamp":
                            char.name = "Ozwald the Incinerator";
                            char.light += 10;
                            char.brains -= 5;
                            char.description = "A lamp. It's bright, but not that bright!"
                            break;
                        case "old-man":
                            char.name = "Frank"
                            char.brawn -= 5;
                            char.brains += 10;
                            char.description = "A wizened old man. What he's lost in muscle tone, he's learned in the magical arts."
                            break;
                        case "girl":
                            char.name = "Cindy";
                            char.skills += 10;
                            char.light -= 5;
                            char.description = "A little girl. She's scrappy but not very well equipped."
                            break;
                        case "user":
                            char.name = "Joe";
                            char.description = "A man. Just a regular joe.";
                            break;
                        case "woman":
                            char.name = "Jane";
                            char.description = "A woman. Plain jane.";
                            break;
                    }
                    
                    return char;
                });
                
                var characterTemplate = require("../templates/characterSelection.hbs");
                
                $("#menu").append($(characterTemplate({characters: characters})));
                
                function setCharacterUi(selectedCharacter) {
                    //set the active on the character
                    $(".character-selection .character-name-input").attr("placeholder", selectedCharacter.name);
                    $(".character-selection .character-description").text(selectedCharacter.description);
                    $(".character-selection .skills").text(selectedCharacter.skills);
                    $(".character-selection .brains").text(selectedCharacter.brains);
                    $(".character-selection .brawn").text(selectedCharacter.brawn);
                    $(".character-selection .light").text(selectedCharacter.light);
                }
                
                setCharacterUi(characters[0]);
                this.selectedCharacter = characters[0];
                $(".glyphicons-" + characters[0].icon).addClass("active");
                $(".character-selection .stats-container").show();
                
                var data = this;
                $(".character-selection .character-portrait").click(function() {
                    var $this = $(this);
                    
                    $(".character-selection .character-portrait").removeClass("active");
                    $this.addClass("active");
                    
                    var selectedCharacter = _.find(characters, function(character) {
                        return $this.hasClass("glyphicons-" + character.icon);
                    });
                    
                    if (selectedCharacter) {
                        data.selectedCharacter = selectedCharacter;
                        
                        setCharacterUi(selectedCharacter);
                    }
                });
                
                $(".character-selection .character-select-button").click(function() {
                    var name = $(".character-selection .character-name-input").val();
                    
                    if (data.selectedCharacter) {
                        if (name) {
                            data.selectedCharacter.name = name;
                        }
                        
                        entity.sendMessage("start", { character: data.selectedCharacter });
                        $(".character-selection").remove();
                    }
                });
            },
            //game is started, character selection in data
            start: function(entity, data) {
                if (this.gameState !== 'character-selection') {
                    return;
                }
                
                this.gameState = "in-play";
                
                var selectedCharacter = data.character;
                $(".start-your-adventure").show();
                
                $("#game").show();
                
                var player = entity.engine.findEntityByTag("player");
                player.data.character = selectedCharacter;
                player.isActive = true;
                player.sendMessage("change-icon", {icon: selectedCharacter.icon });
                
                entity.engine.findEntitiesByTag('hide-at-start').forEach(function(entity) {
                    entity.sendMessage("show");
                });
                
                var world = entity.engine.findEntityByTag("world");
                world.sendMessage("generate", { seed: selectedCharacter.name + +new Date() });
                
                entity.engine.entities.getList().forEach(function(entity) {
                    entity.sendMessage("game-start");
                })
                
                //start the enemy spawner going
                //var enemySpawner = entity.engine.findEntityByTag("enemy-spawner");
                //enemySpawner.sendMessage("start");
            },
            "game-over": function(entity, data) {
                //todo: handle game over. Show summary of play etc
                $('<div style="position static">Restart</div> ').appendTo($("#game"));
            },
            restart: function(entity, data) {
                //cleanup
                entity.engine.game.restart();
                $(".character-selection").remove();
            }
        }
    };
}