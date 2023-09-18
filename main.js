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

async function updateResource(resource) {
    const response = await fetch(`/resources/${resource.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(resource),
    });

    if (!response.ok) {
        throw new Error(`Error updating resource: ${response.statusText}`);
    }

    return response.json();
}

function add(resource, sibling) {
    const creator = new ElementCreator("article")
        .id(resource.idforDOM);

    creator
        .append(new ElementCreator("h2").text(resource.name))
        .append(new ElementCreator("p").text(resource.age))
        .append(new ElementCreator("p").text(resource.isPet ? "Yes" : "No"))
        .append(new ElementCreator("p").text(resource.birthDate));

    creator
        .append(new ElementCreator("button").text("Edit").listener('click', () => {
            edit(resource);
        }))
        .append(new ElementCreator("button").text("Remove").listener('click', async () => {
            // Call the delete endpoint asynchronously
            await controllerdeleteResource(resource);
            // Once the call returns successfully, remove the resource from the DOM
            remove(resource);
        }));

    const parent = document.querySelector('main');

    if (sibling) {
        creator.replace(parent, sibling);
    } else {
        creator.insertBefore(parent, document.querySelector('#bottom'));
    }
}

function edit(animal) {
    const formCreator = new ElementCreator("form")
        .id(animal.idforDOM)
        .append(new ElementCreator("h3").text("Edit " + animal.name));

    formCreator
        .append(new ElementCreator("label").text("Name").with("for", "animal-name"))
        .append(new ElementCreator("input").id("animal-name").with("type", "text").with("value", animal.name))
        .append(new ElementCreator("label").text("Age").with("for", "animal-age"))
        .append(new ElementCreator("input").id("animal-age").with("type", "number").with("value", animal.age))
        .append(new ElementCreator("label").text("Is Pet").with("for", "animal-isPet"))
        .append(new ElementCreator("input").id("animal-isPet").with("type", "checkbox").with("checked", animal.isPet))
        .append(new ElementCreator("label").text("Birth Date").with("for", "animal-birthDate"))
        .append(new ElementCreator("input").id("animal-birthDate").with("type", "date").with("value", animal.birthDate))
        .append(new ElementCreator("label").text("Species").with("for", "animal-species"))
        .append(new ElementCreator("input").id("animal-species").with("type", "text").with("value", animal.species));

    formCreator
        .append(new ElementCreator("button").text("Speichern").listener('click', async (event) => {
            event.preventDefault();
            animal.name = document.getElementById("animal-name").value;
            animal.age = document.getElementById("animal-age").value;
            animal.isPet = document.getElementById("animal-isPet").checked;
            animal.birthDate = document.getElementById("animal-birthDate").value;
            animal.species = document.getElementById("animal-species").value;

            // Call the update endpoint asynchronously
            const response = await fetch(`/api/update/${animal.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(animal),
            });

            if (!response.ok) {
                console.error(`Error updating resource: ${response.statusText}`);
                return;
            }

            // Once the call returns successfully, remove the form and render the resource in the list.
            add(animal, document.getElementById(animal.idforDOM));
        }))
        .replace(document.querySelector('main'), document.getElementById(animal.idforDOM));
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
            .id("new-animal-form")
            .append(new ElementCreator("h3").text("Create New Animal"));
    
        formCreator
            .append(new ElementCreator("label").text("Name").with("for", "animal-name"))
            .append(new ElementCreator("input").id("animal-name").with("type", "text"))
            .append(new ElementCreator("label").text("Age").with("for", "animal-age"))
            .append(new ElementCreator("input").id("animal-age").with("type", "number"))
            .append(new ElementCreator("label").text("Is Pet").with("for", "animal-isPet"))
            .append(new ElementCreator("input").id("animal-isPet").with("type", "checkbox"))
            .append(new ElementCreator("label").text("Birth Date").with("for", "animal-birthDate"))
            .append(new ElementCreator("input").id("animal-birthDate").with("type", "date"));
    
        formCreator
            .append(new ElementCreator("button").text("Speichern").listener('click', async (event) => {
                event.preventDefault();
                const animal = new Animal();
                animal.name = document.getElementById('animal-name').value;
                animal.age = document.getElementById('animal-age').value;
                animal.isPet = document.getElementById('animal-isPet').checked;
                animal.birthDate = document.getElementById('animal-birthDate').value;
    
                try {
                    const createdAnimal = await createResource(animal);
                    // Once the call returns successfully, remove the form and render the resource in the list.
                    add(createdAnimal);
                    document.getElementById('new-animal-form').remove();
                } catch (error) {
                    console.error(`Error creating resource: ${error}`);
                }
            }));
    
        document.querySelector('main').appendChild(formCreator.create());
    }
    
    

async function createResource(resource) {
        const response = await fetch(`/resources`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resource),
        });
    
        if (!response.ok) {
            throw new Error(`Error creating resource: ${response.statusText}`);
        }
    
        return response.json();
    }

document.addEventListener("DOMContentLoaded", function (event) {

    fetch("/resources")
        .then(response => response.json())
        .then(resources => {
            for (const resource of resources) {
                add(Object.assign(new Resource(), resource));
            }
        });
});

