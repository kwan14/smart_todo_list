function createCategoryCircles(catId) {
  var keyNum = $("ul[data-category=" + catId + "]").data("key");

  const circle1 = $("<i>")
    .addClass("cat-color-0")
    .data("key", 0)
    .attr("aria-hidden", "true");
  const circle2 = $("<i>")
    .addClass("cat-color-1")
    .data("key", 1)
    .attr("aria-hidden", "true");
  const circle3 = $("<i>")
    .addClass("cat-color-2")
    .data("key", 2)
    .attr("aria-hidden", "true");
  const circle4 = $("<i>")
    .addClass("cat-color-3")
    .data("key", 3)
    .attr("aria-hidden", "true");

  if (keyNum === 0) {
    circle1.addClass("fa fa-circle").addClass("current-category");
    circle2.addClass("fa fa-circle-o").addClass("alternate-category");
    circle3.addClass("fa fa-circle-o").addClass("alternate-category");
    circle4.addClass("fa fa-circle-o").addClass("alternate-category");
  }

  if (keyNum === 1) {
    circle1.addClass("fa fa-circle-o").addClass("alternate-category");
    circle2.addClass("fa fa-circle").addClass("current-category");
    circle3.addClass("fa fa-circle-o").addClass("alternate-category");
    circle4.addClass("fa fa-circle-o").addClass("alternate-category");
  }

  if (keyNum === 2) {
    circle1.addClass("fa fa-circle-o").addClass("alternate-category");
    circle2.addClass("fa fa-circle-o").addClass("alternate-category");
    circle3.addClass("fa fa-circle").addClass("current-category");
    circle4.addClass("fa fa-circle-o").addClass("alternate-category");
  }

  if (keyNum === 3) {
    circle1.addClass("fa fa-circle-o").addClass("alternate-category");
    circle2.addClass("fa fa-circle-o").addClass("alternate-category");
    circle3.addClass("fa fa-circle-o").addClass("alternate-category");
    circle4.addClass("fa fa-circle").addClass("current-category");
  }

  const categoryDiv = $("<div>")
    .addClass("category-button")
    .append(circle1)
    .append(circle2)
    .append(circle3)
    .append(circle4)
    .css("display", "inline-block");

  return categoryDiv;
}

function createTodo(itemObj) {
  const listItem = $("<li>")
    .addClass("item-wrapper")
    .data("id", itemObj.id);

  const trash = $("<i>")
    .addClass("fa fa-trash-o")
    .attr("aria-hidden", "true");
  const trashDiv = $("<div>")
    .addClass("delete-button")
    .append(trash)
    .css("display", "inline-block");
  const marker = $("<i>")
    .addClass("fa fa-circle-o")
    .attr("aria-hidden", "true");
  const markerDiv = $("<div>")
    .addClass("marker-button")
    .append(marker);

  var categoryDiv = createCategoryCircles(itemObj.categoryId);

  const actionDiv = $("<div>")
    .addClass("action-button")
    .append(trashDiv)
    .append(categoryDiv)
    .css("display", "none");

  listItem
    .append(markerDiv)
    .append(
      $("<span>")
        .addClass("item-text")
        .addClass('auto-wrap')
        .attr("contentEditable", "true")
        .text(itemObj.text)
    )
    .append(actionDiv);

  listItem.prependTo($("ul[data-category=" + itemObj.categoryId + "]"));
}

$(() => {
  function getTodos() {
    return $.ajax({
      method: "GET",
      url: "/todos"
    });
  }

  function loadTodos() {
    return getTodos().done(todos => {
      for (var i = 0; i < todos.length; i++) {
        var categoryId = todos[i].category_id;

        createTodo({
          text: todos[i].item,
          id: todos[i].id,
          categoryId: categoryId
        });
      }
    });
  }

  loadTodos();

  function createNewTodo(event) {
    var text = $(".todo-post-box").val();

    event.preventDefault();
    $.ajax({
      method: "POST",
      url: "/todos",
      data: { text: text }
    }).done(function(result) {
      console.log(result);
      $(".todo-post-box").val("");
      createTodo({
        text: text,
        id: result.id,
        categoryId: result.category_id
      });

      console.log(result.category_id);
    });
  }

  function updateTodo(text, itemId, $elem) {
    let data = { id: itemId, item: text };
    // later feed in categoryId into this data object
    $.ajax({
      method: "POST",
      url: "/user/:id/update-text/:todo_id",
      data: { data: data }
    })
      .done(function(result) {
        $elem.parent("li").remove();
        createTodo({
          text: result[0].item,
          id: result[0].id,
          categoryId: result[0].category_id
        });
      })
      .fail(function(err) {
        console.log(err);
      });
  }

  $("body").on("keypress", "[contenteditable]", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      let text = $(event.target).text();
      const itemId = $(event.target)
        .closest("li")
        .data("id");
      updateTodo(text, itemId, $(event.target));
    }
  });

  function updateTodoCategory(newCategoryId, itemId, $elem) {
    let data = { id: itemId, category_id: newCategoryId };
    // later feed in categoryId into this data object
    $.ajax({
      method: "POST",
      url: "/user/:id/update-category/:todo_id",
      data: { data: data },
      success: function() {
        console.log("successful");
        $elem.remove();
        createTodo({
          text: $elem.find("span").text(),
          id: itemId,
          categoryId: newCategoryId
        });
      }
    }).fail(function(err) {
      console.log("unsuccessful");
      console.log(err);
    });
  }

  $(".todo-list").on("click", ".category-button", function(event) {
    event.preventDefault();

    const itemId = $(event.target)
      .closest("li")
      .data("id");

    const listKey = $(event.target)
      .closest("ul")
      .data("key");
    const clickedKey = $(event.target).data("key");

    console.log("clickedKey" + clickedKey);
    console.log("listKey" + listKey);

    if (clickedKey !== listKey) {
      var newCategoryId = $(".category-button .cat-color-0.fa-circle-o")
        .closest(".container")
        .find("ul[data-key=" + clickedKey + "]")
        .data("category");

      var $elem = $(event.target).closest("li");

      updateTodoCategory(newCategoryId, itemId, $elem);
    }
  });

  $(".todo-list").on("click", "li", function(event) {
    $(event.target)
      .siblings(".action-button")
      .show()
      .css("display", "inline");
    $(document).mouseup(function(e) {
      var container = $(event.target).siblings(".action-button");

      // if the target of the click isn't the container nor a descendant of the container
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
      }
    });
  });

  $(".todo-list").on("click", ".circle-button", function(event) {
    let $this = $(event.target)
      .parent()
      .parert();
    console.log($this);
  });

  $(".todo-list").on("click", ".fa-trash-o", function(event) {
    const itemId = $(event.target)
      .closest("li")
      .data("id");
    event.preventDefault();
    $.ajax({
      method: "POST",
      url: "/user/:id/delete/:todo_id",
      data: { id: itemId },
      success: function(res) {
        console.log(res);
      }
    })
      .done(function(result) {
        $(event.target)
          .closest("li")
          .remove();
      })
      .fail(function(err) {
        console.log(err);
      });
  });

  $(".todo-button").on("click", createNewTodo);

  $(".todo-post-box").on("keypress", function(event) {
    if (event.which === 13) {
      createNewTodo(event);
    }
  });

  $(".todo-post-box").submit(function(event) {
    createNewTodo(event);
  });

  $(".header-toggle")
    .find("i")
    .on("click", function(event) {
      $(event.target)
        .parent()
        .parent()
        .siblings(".toggle-list")
        .toggle("hide");
    });
});
