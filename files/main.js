/* A builder class to simplify the task of creating HTML elements */
class ElementCreator {
    constructor(tag) {
        this.element = document.createElement(tag);
    }

    id(id) {
        this.element.id = id;
        return this;
    }

    class(clazz) {
        this.element.class = clazz;
        return this;
    }

    text(content) {
        this.element.innerHTML = content;
        return this;
    }

    with(name, value) {
        this.element.setAttribute(name, value)
        return this;
    }

    listener(name, listener) {
        this.element.addEventListener(name, listener)
        return this;
    }

    append(child) {
        child.appendTo(this.element);
        return this;
    }

    prependTo(parent) {
        parent.prepend(this.element);
        return this.element;
    }

    appendTo(parent) {
        parent.append(this.element);
        return this.element;
    }

    insertBefore(parent, sibling) {
        parent.insertBefore(this.element, sibling);
        return this.element;
    }

    replace(parent, sibling) {
        parent.replaceChild(this.element, sibling);
        return this.element;
    }
}

/* A class representing a resource. This class is used per default when receiving the
   available resources from the server (see end of this file).
   You can (and probably should) rename this class to match with whatever name you
   used for your resource on the server-side.
 */
class Resource {

    /* If you want to know more about this form of getters, read this:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get */
    get idforDOM() {
        return `resource-${this.id}`;
    }

}

function add(resource, sibling) {

    const creator = new ElementCreator("article")
        .id(resource.idforDOM);

    /* Task 2: Instead of the name property of the example resource, add the properties of
       your resource to the DOM. If you do not have the name property in your resource,
       start by removing the h2 element that currently represents the name. For the 
       properties of your object you can use whatever html element you feel represents
       your data best, e.g., h2, paragraphs, spans, ... 
       Also, you don't have to use the ElementCreator if you don't want to and add the
       elements manually. */

    creator
        .append(new ElementCreator("h2").text(resource.canopyModel))
        .append(new ElementCreator("p").text("Jump Height (m): " + resource.jumpHeightMt))
        .append(new ElementCreator("p").text("Canopy Failed: " + (resource.canopyFailed ? "Yes" : "No")))
        /* To Do: Format Date */
        .append(new ElementCreator("p").text("Jump Date: " + resource.jumpDate));

    if (resource.notes && resource.notes.trim() !== '') {
        creator.append(new ElementCreator("p").text("Notes: " + resource.notes));
    
    }        
creator
    .append(new ElementCreator("button").text("Edit").listener('click', () => {
        edit(resource);
    }))
    .append(new ElementCreator("button").text("Remove").listener('click', () => {
        fetch('/api/jumps/' + resource.id, {
            method: 'DELETE',
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            remove(resource);  // This call removes the resource from the DOM.
        })
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    }));
    const parent = document.querySelector('main');

    if (sibling) {
        creator.replace(parent, sibling);
    } else {
        creator.insertBefore(parent, document.querySelector('#bottom'));
    }
        
}

function edit(resource) {
    const formCreator = new ElementCreator("form")
        .id(resource.idforDOM)
        .append(new ElementCreator("h3").text("Edit " + resource.canopyModel));
    
    formCreator
        .append(new ElementCreator("label").text("Canopy Model").with("for", "resource-canopyModel"))
        .append(new ElementCreator("input").id("resource-canopyModel").with("type", "text").with("value", resource.canopyModel))
        .append(new ElementCreator("label").text("Jump Height (m)").with("for", "resource-jumpHeightMt"))
        .append(new ElementCreator("input").id("resource-jumpHeightMt").with("type", "number").with("value", resource.jumpHeightMt))
        .append(new ElementCreator("label").text("Canopy Failed").with("for", "resource-canopyFailed"))
        .append(new ElementCreator("input").id("resource-canopyFailed").with("type", "checkbox").with("checked", resource.canopyFailed))
        .append(new ElementCreator("label").text("Jump Date").with("for", "resource-jumpDate"))
        .append(new ElementCreator("input").id("resource-jumpDate").with("type", "date").with("value", resource.jumpDate))
        .append(new ElementCreator("label").text("Notes").with("for", "resource-notes"))
        .append(new ElementCreator("input").id("resource-notes").text(resource.notes));

    formCreator
        .append(new ElementCreator("button").text("Speichern").listener('click', (event) => {
            event.preventDefault();

            resource.canopyModel = document.getElementById("resource-canopyModel").value;
            resource.jumpHeightMt = document.getElementById("resource-jumpHeightMt").value;
            resource.canopyFailed = document.getElementById("resource-canopyFailed").checked;
            resource.jumpDate = document.getElementById("resource-jumpDate").value;
            resource.notes = document.getElementById("resource-notes").value;

            add(resource, document.getElementById(resource.idforDOM));  // Call this after the resource is updated successfully on the server
        }))
        .replace(document.querySelector('main'), document.getElementById(resource.idforDOM));
}

function remove(resource) {
    document.getElementById(resource.idforDOM).remove();
}

/* Task 5 - Create a new resource is very similar to updating a resource. First, you add
   an empty form to the DOM with the exact same fields you used to edit a resource.
   Instead of PUTing the resource to the server, you POST it and add the resource that
   the server returns to the DOM (Remember, the resource returned by the server is the
    one that contains an id).
 */
    function create() {
        const formCreator = new ElementCreator("form")
            .id("newResource")
            .append(new ElementCreator("h3").text("Create New Resource"));
    
        // Add the same fields as in the edit form
        formCreator
            .append(new ElementCreator("label").text("Canopy Model").with("for", "resource-canopyModel"))
            .append(new ElementCreator("input").id("resource-canopyModel").with("type", "text"))
            .append(new ElementCreator("label").text("Jump Height (m)").with("for", "resource-jumpHeightMt"))
            .append(new ElementCreator("input").id("resource-jumpHeightMt").with("type", "number"))
            .append(new ElementCreator("label").text("Canopy Failed").with("for", "resource-canopyFailed"))
            .append(new ElementCreator("input").id("resource-canopyFailed").with("type", "checkbox"))
            .append(new ElementCreator("label").text("Jump Date").with("for", "resource-jumpDate"))
            .append(new ElementCreator("input").id("resource-jumpDate").with("type", "date"))
            .append(new ElementCreator("label").text("Notes").with("for", "resource-notes"))
            .append(new ElementCreator("input").id("resource-notes"));
    
        formCreator
        .append(new ElementCreator("button").text("Create").listener('click', (event) => {
            event.preventDefault();
    
            // Create a new resource object from the input values
            const newResource = {
                canopyModel: document.getElementById("resource-canopyModel").value,
                jumpHeightMt: document.getElementById("resource-jumpHeightMt").value,
                canopyFailed: document.getElementById("resource-canopyFailed").checked,
                jumpDate: document.getElementById("resource-jumpDate").value,
                notes: document.getElementById("resource-notes").value,
            };
    
            // POST the new resource to the server
            fetch('/api/jumps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newResource),
            })
            .then((response) => response.json())
            .then((data) => {
                // Add the new resource to the DOM
                add(data);
    
                // Remove the form from the DOM
                document.getElementById('newResource').remove();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }));
    
        const parent = document.querySelector('main');
        formCreator.insertBefore(parent, document.querySelector('#create').nextSibling);

    }
    
    

document.addEventListener("DOMContentLoaded", function (event) {
    fetch("/api/jumps")
        .then(response => response.json())
        .then(resources => {
            for (const resource of resources) {
                add(Object.assign(new Resource(), resource));
            }
        });
});

