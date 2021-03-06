/*
 * spa.shell.js
 * Shell module for SPA
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global $, spa */

spa.shell = (function () {
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      anchor_schema_map : {
        chat  : { open : true, closed : true }
      },
      main_html : String()
        + '<div class="spa-shell-head">'
          + '<div class="spa-shell-head-logo"></div>'
          + '<div class="spa-shell-head-navButton" ></div>'
          + '<div class="spa-shell-head-acct"></div>'
          + '<div class="spa-shell-head-search"></div>'
        + '</div>'
        + '<div class="spa-shell-main">'
          + '<div class="spa-shell-main-nav"></div>'
          + '<div class="spa-shell-main-content"></div>'
        + '</div>'
        + '<div class="spa-shell-foot"></div>'
        + '<div class="spa-shell-chat"></div>'
        + '<div class="spa-shell-modal"></div>',
      chat_extend_time        : 1000,
      chat_retract_time       : 300,
      chat_extend_height      : 450,
      chat_retract_height     : 15,
      chat_extended_title     : 'Click to retract',
      chat_retracted_title    : 'Click to extend',
      navBar_extended_title   : 'Click to retract',
      navBar_retracted_title  : 'Click to extend',
      navBar_extend_time      : 1000,
      navBar_retract_time     : 300,
      navBar_extend_length    : 200,
      navBar_retracted_length : 10
    },
    stateMap  = {
      $container           : null,
      anchor_map           : {},
      is_chat_retracted    : true,
      is_navBar_retracted  : true
    },
    jqueryMap = {},

    copyAnchorMap,    setJqueryMap,   toggleChat,
    changeAnchorPart, onHashchange,   toggleNavBar,
    onClickChat,      onClickNavBar,  initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  // Returns copy of stored anchor map; minimizes overhead
  copyAnchorMap = function () {
    return $.extend( true, {}, stateMap.anchor_map );
  };
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$container;

    jqueryMap = {
      $container : $container,
      $chat      : $container.find( '.spa-shell-chat' ),
      $navBar    : $container.find( '.spa-shell-main-nav' )
    };
  };
  // End DOM method /setJqueryMap/

  // Begin DOM method /toggleChat/
  // Purpose   : Extends or retracts chat slider
  // Arguments :
  //   * do_extend - if true, extends slider; if false retracts
  //   * callback  - optional function to execute at end of animation
  // Settings  :
  //   * chat_extend_time, chat_retract_time
  //   * chat_extend_height,   chat_retract_height
  // Returns   : boolean
  //   * true  - slider animation activated
  //   * false - slider animation not activated
  // State     : sets stateMap.is_chat_retracted
  //   * true  - slider is retracted
  //   * false - slider is extended
  //
  toggleChat = function ( do_extend, callback) {
    var
      px_chat_ht = jqueryMap.$chat.height(),
      is_open    = px_chat_ht === configMap.chat_extend_height,
      is_closed  = px_chat_ht === configMap.chat_retract_height,
      is_sliding = ! is_open && ! is_closed;

    // avoid race condition
    if ( is_sliding ) { return false; }

    // Begin extend chat slider
    if ( do_extend ) {
      jqueryMap.$chat.animate(
        { height : configMap.chat_extend_height },
        configMap.chat_extend_time,
        function () {
          jqueryMap.$chat.attr(
            'title', configMap.chat_extended_title
          );
          stateMap.is_chat_retracted = false;
          if ( callback ) { callback( jqueryMap.$chat ); }
        }
      );
      return true;
    }
    // End extend chat slider

    // Begin retract chat slider
    jqueryMap.$chat.animate(
      { height : configMap.chat_retract_height },
      configMap.chat_retract_time,
      function () {
        jqueryMap.$chat.attr(
         'title', configMap.chat_retracted_title
        );
        stateMap.is_chat_retracted = true;
        if ( callback ) { callback( jqueryMap.$chat ); }
      }
    );
    return true;
    // End retract chat slider
  };
  // End DOM method /toggleChat/




  //Begin DOM method /toggleNavBar/

  toggleNavBar = function ( do_extend, callback) {
      var
        px_navBar_lngth = jqueryMap.$navBar.height(),
        is_open         = px_navBar_lngth === configMap.navBar_extend_length,
        is_closed       = px_navBar_lngth === configMap.navBar_retract_length,
        is_sliding      = ! is_open && ! is_closed;

      // avoid race condition
      if ( is_sliding ) { return false; }

      // Begin extend chat slider
      if ( do_extend ) {
        jqueryMap.$navBar.animate(
          { height : configMap.navBar_extend_length },
          configMap.navBar_extend_time,
          function () {
            jqueryMap.$navBar.attr(
              'title', configMap.navBar_extended_title
            );
            stateMap.is_navBar_retracted = false;
            if ( callback ) { callback( jqueryMap.$navBar ); }
          }
        );
        return true;
      }
      // End extend chat slider

      // Begin retract chat slider
      jqueryMap.$chat.animate(
        { height : configMap.navBar_retract_length },
        configMap.navBar_retract_time,
        function () {
          jqueryMap.$navBar.attr(
           'title', configMap.navBar_retract_length
          );
          stateMap.is_navBar_retracted = true;
          if ( callback ) { callback( jqueryMap.$navBar ); }
        }
      );
      return true;
};
  // Begin DOM method /changeAnchorPart/
  // Purpose  : Changes part of the URI anchor component
  // Arguments:
  //   * arg_map - The map describing what part of the URI anchor
  //     we want changed.
  // Returns  : boolean
  //   * true  - the Anchor portion of the URI was update
  //   * false - the Anchor portion of the URI could not be updated
  // Action   :
  //   The current anchor rep stored in stateMap.anchor_map.
  //   See uriAnchor for a discussion of encoding.
  //   This method
  //     * Creates a copy of this map using copyAnchorMap().
  //     * Modifies the key-values using arg_map.
  //     * Manages the distinction between independent
  //       and dependent values in the encoding.
  //     * Attempts to change the URI using uriAnchor.
  //     * Returns true on success, and false on failure.
  //
  changeAnchorPart = function ( arg_map ) {
    var
      anchor_map_revise = copyAnchorMap(),
      bool_return       = true,
      key_name, key_name_dep;

    // Begin merge changes into anchor map
    KEYVAL:
    for ( key_name in arg_map ) {
      if ( arg_map.hasOwnProperty( key_name ) ) {

        // skip dependent keys during iteration
        if ( key_name.indexOf( '_' ) === 0 ) { continue KEYVAL; }

        // update independent key value
        anchor_map_revise[key_name] = arg_map[key_name];

        // update matching dependent key
        key_name_dep = '_' + key_name;
        if ( arg_map[key_name_dep] ) {
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        }
        else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }
    // End merge changes into anchor map

    // Begin attempt to update URI; revert if not successful
    try {
      $.uriAnchor.setAnchor( anchor_map_revise );
    }
    catch ( error ) {
      // replace URI with existing state
      $.uriAnchor.setAnchor( stateMap.anchor_map,null,true );
      bool_return = false;
    }
    // End attempt to update URI...

    return bool_return;
  };
  // End DOM method /changeAnchorPart/
  //--------------------- END DOM METHODS ----------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  // Begin Event handler /onHashchange/
  // Purpose  : Handles the hashchange event
  // Arguments:
  //   * event - jQuery event object.
  // Settings : none
  // Returns  : false
  // Action   :
  //   * Parses the URI anchor component
  //   * Compares proposed application state with current
  //   * Adjust the application only where proposed state
  //     differs from existing
  //
  onHashchange = function ( event ) {
    var
      anchor_map_previous = copyAnchorMap(),
      anchor_map_proposed,
      _s_chat_previous, _s_chat_proposed,
      s_chat_proposed, _s_navBar_previous,
      _s_navBar_proposed, s_navBar_proposed


    // attempt to parse anchor
    try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
    catch ( error ) {
      $.uriAnchor.setAnchor( anchor_map_previous, null, true );
      return false;
    }
    stateMap.anchor_map = anchor_map_proposed;

    // convenience vars
    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;
    _s_navBar_previous = anchor_map_previous._s_navBar;
    _s_navBar_proposed = anchor_map_proposed._s_navBar;

    // Begin adjust chat component if changed
    if ( ! anchor_map_previous
     || _s_chat_previous !== _s_chat_proposed
    ) {
      s_chat_proposed = anchor_map_proposed.chat;
      switch ( s_chat_proposed ) {
        case 'open'   :
          toggleChat( true );
        break;
        case 'closed' :
          toggleChat( false );
        break;
        default  :
          toggleChat( false );
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
      }
    }
    // End adjust chat component if changed

    // Begin adjust navBar component if changed
    if ( ! anchor_map_previous
     || _s_navBar_previous !== _s_navBar_proposed
    ) {
      s_navBar_proposed = anchor_map_proposed.navBar;
      switch ( s_navBar_proposed ) {
        case 'open'   :
          toggleNavBar( true );
        break;
        case 'closed' :
          toggleNavBar( false );
        break;
        default  :
          toggleNavBar( false );
          delete anchor_map_proposed.navBar;
          $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
      }
    }
    // End adjust navBar component if changed

    return false;
  };
  // End Event handler /onHashchange/

  // Begin Event handler /onClickChat/
  onClickChat = function ( event ) {
    changeAnchorPart({
      chat : ( stateMap.is_chat_retracted ? 'open' : 'closed' )
    });

    toggleNavBar(true);

    return false;
  };
  // End Event handler /onClickChat/

  // Begin Event handler /onClickNavBar/
  onClickNavBar = function ( event ) {
    changeAnchorPart({
      navBar : ( stateMap.is_navBar_retracted ? 'open' : 'closed' )
    });
  };
  // End Event handler /onClickNavBar/

  //-------------------- END EVENT HANDLERS --------------------

  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin Public method /initModule/
  initModule = function ( $container ) {
    // load HTML and map jQuery collections
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    setJqueryMap();

    // initialize chat slider and bind click handler
    stateMap.is_chat_retracted = true;
    jqueryMap.$chat
      .attr( 'title', configMap.chat_retracted_title )
      .click( onClickChat );

    //initialize navBar slider and bind click handler
    stateMap.is_navBar_retracted = true;
    jqueryMap.$navBar
      .attr( 'title', configMap.navBar_retracted_title )
      .click( onClickNavBar );

    // configure uriAnchor to use our schema
    $.uriAnchor.configModule({
      schema_map : configMap.anchor_schema_map
    });

    // Handle URI anchor change events.
    // This is done /after/ all feature modules are configured
    // and initialized, otherwise they will not be ready to handle
    // the trigger event, which is used to ensure the anchor
    // is considered on-load
    //
    $(window)
      .bind( 'hashchange', onHashchange )
      .trigger( 'hashchange' );

  };
  // End PUBLIC method /initModule/

  return { initModule : initModule };
  //------------------- END PUBLIC METHODS ---------------------
}());
