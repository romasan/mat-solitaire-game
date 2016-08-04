var MIN_X_OFFSET = 4;
var INFO_HEIGHT = 50;
var CARD_Y_OFFSET=20;
var CARD_Y_MIN_OFFSET=3;
var CARDS_TOTAL = 52;
window.floading = false;

var LOCK_MOUSE = false

// ======================================================================================================

var colors = ['h', 'd', 'c', 's']
var cards36 = [1, 6, 7, 8, 9, 10, 'j', 'q', 'k']
var cards52 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'j', 'q', 'k']

var EMPTY = 0

var start_map = []
var replace_map = []

var card = {
    width: 71,
    height: 96,
    space_x: -1,
    space_y: 10
}

var game_id = null

var cards_set = []

var LINES_LENGTH = 4

var HELP = false

var SHOW_ANIMATION = true

// ======================================================================================================

function is_touch_device() {  
  try {  
    document.createEvent("TouchEvent");  
    return true;  
  } catch (e) {  
    return false;  
  }  
}

function shuffle(o) {
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    var y = 0, x = 1;
    for(i in o) {
        if(x > 13) {
            x = 1;
            y += 1;
        }
        o[i].y = y;
        o[i].x = x;
        x += 1

    }
    return o;
}

var prev_card52 = function(card) {
    if(card <= 1) return false
    for(i in cards52) if(cards52[i] == card) return cards52[i - 1]
    return false
}
var next_card52 = function(card) {
    if(card >= cards52.length - 1) return false
    for(i in cards52) if(cards52[i] == card) return cards52[(i|0) + 1]
    return false
}

var find_card_id = function(_id) {
    for(i in cards_set) 
        if(cards_set[i].x == _id[1] && cards_set[i].y == _id[2]) 
            return cards_set[i].card_id
    return null
}
var find_card_index = window.find_card_index = function(id) {
    for(i in cards_set) 
        if(cards_set[i].card_id == id) 
            return i
}
var card_in = function(x, y) {
    for(i in cards_set) if(cards_set[i].x == x && cards_set[i].y == y) return true;
    return false;
}

var apply_replace = function(_replace_map) {
    cards_set = []
    window.replace_map = _replace_map
    //var _cards_set = []
    a = _replace_map.split(';')
    b = []
    for(i in a) b.push(a[i].split(','))
    var y = null, x = null
    for(y in b) {
        for(x in b[y]) {
            cards_set.push({
                card_id: b[y][x],
                card_color: b[y][x].slice(0, 1),
                card_value: b[y][x].slice(1, 99),
                card_img: ('img/' + b[y][x] + '.png'),
                fixed: false,
                x: (x|0) + 1,
                y: y
            })
            //}
        }
    }
//    return _cards_set
}
var first_col_slots = function() {
    var E = EMPTY, _temp_map = [
        [E, E, E, E, E, E, E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E, E, E, E, E, E, E]
    ]
    var i = null
    for(i in cards_set) {
        _temp_map[cards_set[i].y][cards_set[i].x] = cards_set[i].card_id
    }
    var _count = []
    for(i in _temp_map) {
        if( _temp_map[i][0] == E) _count.push(i)
    }
    return _count.length == 1 ? _count.pop() : -1
}

var check_fixed = window.check_fixed = function(__cards_set) {
            
    $(".card_place").removeClass("fixed_card")
    $('.card').css({opacity: '1'})
    var E = EMPTY, _temp_map = [
        [E, E, E, E, E, E, E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E, E, E, E, E, E, E]
    ]
    
    var i = null
    for(i in cards_set) {
        _temp_map[cards_set[i].y][cards_set[i].x] = cards_set[i].card_id
        cards_set[i].x = cards_set[i].x|0
        cards_set[i].y = cards_set[i].y|0
        cards_set[i].fixed = false
    }

    var line_fixed = 0
    for(i in _temp_map) {
        try{line_fixed += _temp_map[i][0].slice(1, 99) == cards52[0] ? 1 : 0} catch(e) {}
    }
    for(i in cards_set) {
        if( cards_set[i].card_value == 1 
         && cards_set[i].x == 0
         && cards_set[i].fixed == false
        ) {
            cards_set[i].fixed = true
            try{if(
                    line_fixed == 4 
                 || (
                     _temp_map[cards_set[i].y][cards_set[i].x].slice(1, 99) == prev_card52(_temp_map[cards_set[i].y][(cards_set[i].x|0) + 1].slice(1, 99))
                  && _temp_map[cards_set[i].y][cards_set[i].x].slice(0, 1) == _temp_map[cards_set[i].y][(cards_set[i].x|0) + 1].slice(0, 1)
                 )
                ) {
                $('#' + cards_set[i].card_id).css({opacity: '.5'})
                $('#place_' + cards_set[i].x + '_' + cards_set[i].y).addClass('fixed_card')
            }} catch(e) {}
        }
    }

    for(y in _temp_map) {
        var last_rank = last_color = last_x = false
        for(i in _temp_map[y]) if(_temp_map[y][i] != EMPTY) last_color = _temp_map[y][i].slice(0, 1)
        for(x in _temp_map[y]) {
            if(_temp_map[y][x] == EMPTY) break;
            for(_i in cards_set) {
                if(cards_set[_i].card_id == _temp_map[y][x]) {
                    if(last_rank == false) {
                        last_color = cards_set[_i].card_color,
                        last_rank = cards_set[_i].card_value
                        last_fixed = cards_set[_i].fixed
                        last_x = cards_set[_i].x
                    } else {
                        var _color = cards_set[_i].card_color,
                        _rank = cards_set[_i].card_value
                        if(_color == last_color) {
                            if( prev_card52(_rank) == last_rank 
                             && cards_set[_i].fixed == false 
                             && last_fixed == true 
                             && _temp_map[y][x - 1].slice(1, 99) == prev_card52(_rank)
                             && _temp_map[y][x - 1].slice(0, 1) == _color
                             //&& last_x == cards_set[_i].x - 1
                            ) {
                                cards_set[_i].fixed = true
                                $('#' + cards_set[_i].card_id).css({opacity: '.5'})
                                //if(
                                //    line_fixed == 4 
                                // || _temp_map[y][(x|0) + 1].slice(1, 99) == next_card52(last_rank)
                                //) {
                                    $('#place_' + cards_set[_i].x + '_' + cards_set[_i].y).addClass('fixed_card')
                                //}
                            } else break;
                        } else break;
                        last_rank = _rank
                    }
                }
            }
        }
    }

    var all_fixed = true
    for(i in cards_set) {
        if(!cards_set[i].fixed) all_fixed = false
    }
    if(all_fixed) {
        $('.card').css({zIndex: 0, opacity: '.3'})
        $('.card_place_shadow').css({zIndex: 0})
        controller.gm.gameIsWon();
        LOCK_MOUSE = true
    }
}

window.help_me = function() {
    help_steps = []
    $(".card_place").removeClass("yellow_shadow")
    $(".card_place").removeClass("yellow_light")
    var _temp_map = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
    for(i in cards_set) {
        _temp_map[cards_set[i].y][cards_set[i].x] = {rank: cards_set[i].card_value, color: cards_set[i].card_color}
    }
    var q = null
    for(y0 in _temp_map) {
        for(x0 in _temp_map[y0]) {
            if(_temp_map[y0][x0] == 0) {
                if(x0 == 0) {
                    if(_temp_map[y0][x0] == 0)
                    for(y1 in _temp_map) {
                        for(x1 in _temp_map[y0]) {
                            if(x1 > 0 && _temp_map[y1][x1].rank == cards52[0]) {
                                /*help_steps.push({
                                    card_id: _temp_map[y1][x1].color + _temp_map[y1][x1].rank,
                                    x: x0,
                                    y: y0
                                })*/
                                if(HELP) {
                                    $("#place_" + x1 + "_" + y1).addClass("yellow_shadow")
                                }
                            }
                        }
                    }
                } else {
                    if( _temp_map[y0][x0 - 1] != 0
                     && _temp_map[y0][x0 - 1].rank != cards52[cards52.length - 1]
                    ) {
                        q = {
                            color: _temp_map[y0][x0 - 1].color,
                            rank: next_card52(_temp_map[y0][x0 - 1].rank)
                        }
                        for(y1 in _temp_map) {
                            for(x1 in _temp_map[y1]) {
                                if( _temp_map[y1][x1] != 0
                                 && _temp_map[y1][x1].color == q.color
                                 && _temp_map[y1][x1].rank == q.rank
                                ) {
                                    help_steps.push({
                                        card_id: _temp_map[y1][x1].color + _temp_map[y1][x1].rank,
                                        x: x0,
                                        y: y0
                                    })
                                    if(HELP) {
                                        $("#place_" + x1 + "_" + y1).addClass("yellow_shadow")
                                    }
                                }
                            }
                        }
                    }
                }

            }
        }
    }

}

window.save_step = function(card_id, slot_x, slot_y) {
    window.controller.gm.logAction({
        card_id: card_id,
        from: {
            x: cards_set[window.find_card_index(card_id)].x,
            y: cards_set[window.find_card_index(card_id)].y
        },
        to: {
            x: slot_x,
            y: slot_y
        }
    })
}

var move_card_to = function(card_id, slot_x, slot_y, fixing) {
    if(SHOW_ANIMATION) {
        $('.card').finish()
        $('#' + card_id).css({
            zIndex: 98
        }).animate({
            left: slot_x * card.space_x + slot_x * card.width + 'px',
            top:  slot_y * card.space_y + slot_y * card.height + 'px'
        }, function() {
            window.check_fixed()
            $(this).css({
                zIndex: 97
            })
            $(".yellow_shadow").css({zIndex: 99})
            window.help_me()
        })
    } else {
        $('#' + card_id).css({
            zIndex: 97,
            left: slot_x * card.space_x + slot_x * card.width + 'px',
            top:  slot_y * card.space_y + slot_y * card.height + 'px'
        })
        window.check_fixed()
        $(".yellow_shadow").css({zIndex: 99})
        window.help_me()
    }

}

var move_card = function(card_id, slot_x, slot_y, fixing) {
    for(_i in help_steps) {
        if(help_steps[_i].card_id == card_id) {
            var id = find_card_index(card_id)
            window.save_step(card_id, help_steps[_i].x|0, help_steps[_i].y|0)
            cards_set[id].x = help_steps[_i].x
            cards_set[id].y = help_steps[_i].y
            move_card_to(card_id, help_steps[_i].x, help_steps[_i].y, fixing)
            return;
        }
    }
    move_card_to(card_id, slot_x, slot_y, fixing)
}

var _undoMove = function(move) {
    cards_set[find_card_index(move.card_id)].x = move.from.x
    cards_set[find_card_index(move.card_id)].y = move.from.y
    cards_set[find_card_index(move.card_id)].fixed = false
    $("#" + move.card_id).css({opacity: '1'})
    move_card_to(move.card_id, move.from.x, move.from.y, false, true)
}

var _redoMove = function(move) {
    cards_set[find_card_index(move.card_id)].x = move.to.x
    cards_set[find_card_index(move.card_id)].y = move.to.y
    move_card_to(move.card_id, move.to.x, move.to.y, false, false)
}

// ======================================================================================================

            var y = null, x = null
            for(y in colors) {
                start_map[y] = []
                for(x in cards52) start_map[y][x] = {
                    id: colors[y] + cards52[x],
                    color: colors[y],
                    rank: cards52[x]
                }
                start_map[y].push(EMPTY)

                if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                   $(".controlPanelLayout:eq(1)").css({marginTop: '1px'})
                   //$("#gameArea").css({height: '776px'})
                }

                if( is_touch_device() ) {
                    $(".gameAreaLayout").css({widht: '1200px'})
                }
            }
            var push = null
            window.clear_push = function() {
                push = null
            }
            var cdown = function(target, x, y) {
                if($(target).hasClass('fixed_card')) return
                if(push) return
                try {$('.card').finish();} catch(e) {}
                var _id = target.id.split('_')
                var _el_id = find_card_id(_id)
                //$('#' + _el_id).finish()

                if( _id[0] == 'place' && target.className.split(' ').indexOf('fixed_card') < 0 ) {
                    //last_action_time = new Date().getTime()
                    push = {
                        client: {
                            x: x,
                            y: y
                        },
                        el : {
                            id: _el_id,
                            x: parseInt( $('#' + _el_id).css('left') ),
                            y: parseInt( $('#' + _el_id).css('top') ),
                            slot_x: _id[1],
                            slot_y: _id[2]
                        }
                    }
                }

                if( 
                    _id[0] == 'place' 
                 && _id[1] == '0' 
                 && target.className.split(' ').indexOf('fixed_card') >= 0 
                 && $('#place_1_' + _id[2]).hasClass('fixed_card') == false
                ) {
                    push = {
                        client: {
                            x: x,
                            y: y
                        },
                        el : {
                            id: _el_id,
                            x: parseInt( $('#' + _el_id).css('left') ),
                            y: parseInt( $('#' + _el_id).css('top') ),
                            slot_x: _id[1],
                            slot_y: _id[2]
                        }
                    }
                }

            }
            var cmove = function(x, y) {
                if(!push) return
                $('#' + push.el.id).css({
                    left: ( (x|0) - (push.client.x|0) + (push.el.x|0) ) + 'px',
                    top: ( (y|0) - (push.client.y|0) + (push.el.y|0) ) + 'px',
                    zIndex: 98
                })                
            }
            var cend = function(target) {
                if(!push) return

                var _id = target.id.split('_')
                if( _id[0] == 'place' && !card_in(_id[1], _id[2]) ) {

                    if(_id[1] == 0) {
                        try{
                        if( (push.el.id.slice(1, 99)|0) == cards52[0] ) {
                            var id = find_card_index(push.el.id)
                            window.save_step(push.el.id, _id[1], _id[2])
                            cards_set[id].x = _id[1]
                            cards_set[id].y = _id[2]
                            cards_set[id].fixed = true
                            move_card_to(push.el.id, _id[1], _id[2], true)
                            $('#' + target.id).addClass('fixed_card')
                        } else {
                            move_card(push.el.id, push.el.slot_x, push.el.slot_y, false)
                        }
                        } catch(_e) {
                            move_card(push.el.id, push.el.slot_x, push.el.slot_y, false)
                        }
                    } else {
                        var _index = first_col_slots()
                        _index = _index < 0 ? _id[2] : _index
                        if( typeof _id[1] != "undefined" && typeof _index != "undefined"
                         && push.el.id
                         && (push.el.id.slice(1, 99)|0) == cards52[0] 
                         && !card_in(0, _index)
                        ) {
                            var id = find_card_index(push.el.id)
                            window.save_step(push.el.id, 0, _index)
                            cards_set[id].x = 0
                            cards_set[id].y = _index
                            cards_set[id].fixed = true
                            move_card_to(push.el.id, 0, _index)
                        } else {
                            move_card(push.el.id, push.el.slot_x, push.el.slot_y, false)
                        }
                    }

                } else {
                    //alert(push.el.id + " " + _id[1] + " " + _id[2])
                    var _index = first_col_slots()
                        _index = _index < 0 ? _id[2] : _index
                    if( typeof _id[1] != "undefined" && typeof _index != "undefined"
                     && push.el.id
                     && (push.el.id.slice(1, 99)|0) == cards52[0] 
                     && !card_in(0, _index)
                    ) {
                        var id = find_card_index(push.el.id)
                        window.save_step(push.el.id, 0, _index)
                        cards_set[id].x = 0
                        cards_set[id].y = _index
                        cards_set[id].fixed = true
                        move_card_to(push.el.id, 0, _index)
                    } else {
                        move_card(push.el.id, push.el.slot_x, push.el.slot_y, false)
                    }
                }
                push = false
            }
            window.cend = function() {
                if(!push) return
                move_card_to(push.el.id, push.el.slot_x, push.el.slot_y, false)
                push = false
            }
            document.onmousedown = function(e) {
                if(LOCK_MOUSE) return
                cdown(e.target, e.clientX, e.clientY)
            }
            document.onmousemove = function(e) {
                if(LOCK_MOUSE) return
                cmove(e.clientX, e.clientY)
            }
            document.onmouseup = function(e) {
                if(LOCK_MOUSE) return
                cend(e.target)
                //$(".yellow_shadow").removeClass("yellow_shadow")
            }
            if( document.location.hash == "#touchlog" ) {
                $(document.body).append(
                    $("<div>").attr({id: 'touchlog'}).css({
                        position: 'fixed',
                        top: '0px',
                        left: '0px',
                        fontSize: '28pt',
                        background: 'white'
                    })
                )
            }
            document.addEventListener('touchstart', function(e) {
                if(LOCK_MOUSE) return
                $("#touchlog").html("touchstart " + e.touches.length)
                if(e.target.className.split(" ").indexOf("card_place") >= 0 && e.touches.length < 2)
                    e.preventDefault()
                //e.stopPropagation()
                cdown(e.target, e.touches[0].clientX, e.touches[0].clientY)
            }, false)
            document.addEventListener('touchmove', function(e) {
                if(LOCK_MOUSE) return
                $("#touchlog").html("touchmove " + e.touches.length)
                //e.preventDefault()
                //e.stopPropagation()
                //if(e.target.className.split(" ").indexOf("card_place") >= 0)
                cmove(e.touches[0].clientX, e.touches[0].clientY)
            }, false)
            document.addEventListener('touchend', function(e) {
                if(LOCK_MOUSE) return
                $("#touchlog").html("touchend " + e.changedTouches.length)
                if(e.target.className.split(" ").indexOf("card_place") >= 0 && e.changedTouches.length < 2)
                    e.preventDefault()
                cend(document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY))
            }, false)


            HELP = true;
            window.help_me()

// startGame
var startGame = function(gameStructure) {

    console.log(gameStructure);

            LOCK_MOUSE = false

            apply_replace(gameStructure)

            $("#map").html('')

            var x = 0, y = 0
            for(var i = cards_set.length + LINES_LENGTH; i > 0; i -= 1) {
                if(y >= LINES_LENGTH) {
                    y = 0;
                    x += 1
                }
                
                $('#map').append(
                    $('<div>')
                        .addClass('card_place_shadow')
                        .css({
                            width:      card.width  + 'px',
                            height:     card.height + 'px',
                            left:   x * card.space_x + x * card.width  + 'px',
                            top:    y * card.space_y + y * card.height + 'px',
                            zIndex: 2
                        })
                )

                $('#map').append(
                    $('<div>')
                        .addClass('card_place')
                        .attr({id: 'place_' + x + '_' + y})
                        .css({
                            width:      card.width  + 'px',
                            height:     card.height + 'px',
                            left:   x * card.space_x + x * card.width  + 'px',
                            top:    y * card.space_y + y * card.height + 'px',
                            zIndex: 99
                        })
                )
                
                y += 1

            }

            for(i in cards_set) {

                var x = cards_set[i].x,
                    y = cards_set[i].y
                $('#map').append(
                    $('<div>')
                        .addClass('card')
                        .attr({id: cards_set[i].card_id})
                        .css({
                            width:      card.width  + 'px',
                            height:     card.height + 'px',
                            left:   x * card.space_x + x * card.width  + 'px',
                            top:    y * card.space_y + y * card.height + 'px',
                            backgroundImage: 'url(' + cards_set[i].card_img + ')',
                            zIndex: 97
                        })
                )

                cards_set[i].x = x
                cards_set[i].y = y

            }

            check_fixed(cards_set)
            help_me()

            LOCK_MOUSE = false;
};

var _index = document.location.hash.slice(1)|0;
if(_index < 1 || _index > 1000) { _index = 1 + ((Math.random() * 1000)|0); }
document.location.hash = _index;
$.getJSON(
    './games/' + _index + '.json',
    function(e) {
        startGame(e.deck);
    }
);