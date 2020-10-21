const db = firebase.firestore();// importo firestore


//Capturamos el "formulario" con el id='task-form' y su contenido..
const taskform = document.getElementById('task-form');
const taskContainer = document.getElementById('task-container');

let editStatus = false;
let id = ''; //creamos un id vacio para poder manipularlo al editar un componente

//creamos una funcion de guardar tareas...
const saveTask = (title, description) =>
    //le decimos que en la DB guardaremos una coleccion con el nombre 'tasks', guardara .doc() un documento y dentro de este documento se gaurdara un objeto con las siguientes caracteristicas
    db.collection('tasks').doc().set({
        title: title,
        description: description
    });

//creamos una funcion para obtener todas las tareas
const getTasks = () => db.collection('tasks').get();

//creamos una funcion para obtener las Tareas
const getTask = (id) => db.collection('tasks').doc(id).get();

//creamos una funcion encargada de decirnos cuando se obtienen nuevas tareas
const onGetTasks = (callback) => db.collection('tasks').onSnapshot(callback);//De la coleccion de tareas cada vez que una nueva tarea sea agregada(un dato cambie), voy amanejarlo con una funcion (callback)

//creamos una funcion de borrar tareas
const deleteTask = id => db.collection('tasks').doc(id).delete();//desde la collections de tareas quiero que encuentres un elemento con el id que te paso( doc(id) ) y quiero que lo elimines(delete() )...

//funcion para editar tareas
const updateTask = (id, updatedTask) => db.collection('tasks').doc(id).update(updatedTask);//buscame en la collection tasks con el id que te paso y actualiza con el updatedTask que te paso...

//cuando cargue el navegador... voy a gregar un escucha al navegador "onGetTask"(esto viene de firebase)
window.addEventListener('DOMContentLoaded', async (e) => {
    //nos dara un dato cada vez que cambie llamado querySnapshot
    onGetTasks((querySnapshot) => {
        taskContainer.innerHTML = '';//lo llenamos en blanco para qie no se duplique el contenido gaurdado a cada rato
        //recorremos el objeto querySnapshot para ver cada elemento
        querySnapshot.forEach(doc => {
            //console.log(doc.data());//.data() le decimos que nos muestre todo los datos de "doc"

            const task = doc.data();//guardamos el contenido en la const para no tener que escvribir todo el tiempo doc.data()....
            task.id = doc.id;//ingresamos al elemnto id de doc y lo guardmos en task en un elemnto llamado id... para llamarlo usar task.id
            //console.log(task.id);

            taskContainer.innerHTML +=  `<div class="card card-body nt-2 border-primary">
                <h3 class="h5"> ${task.title} </h3>
                <p> ${task.description} </p>
                <div>
                    <button class="btn btn-primary btn-delete" data-id="${task.id}"> Borrar </button>
                    <button class="btn btn-secondary btn-edit" data-id="${task.id}"> Editar </button>
                </div>
            </div>`;

            // buscamos todos los elementos con la clase "btn-delete"
            const btnDelete = document.querySelectorAll('.btn-delete');
            //una vez guardado los recorremos y a cada uno le ponemos un escuhca(addEventListener) para saber cual nota fue seleccionada para borrar
            btnDelete.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    //elimina esta tarea conn el id que te paso (e.target.dataset.id)
                    await deleteTask(e.target.dataset.id);
                })
            });

            //parecido al metodo para borrar
            const btnEdit = document.querySelectorAll('.btn-edit');
            btnEdit.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const doc = await getTask(e.target.dataset.id);
                    //console.log(doc.data());//.data() para obtener sus elementos
                    const task = doc.data();

                    editStatus = true;
                    id = doc.id;

                    //utilizamos a taskform llamdo anteriormente y lo rellenamos con valores siguientes, sacados de la DB
                    taskform['task-title'].value = task.title;
                    taskform['task-description'].value = task.description;
                    taskform['btn-task-form'].innerText = 'Actualizar';
                })
            });

        });
    });
});


taskform.addEventListener('submit', async (e) => {
    e.preventDefault();//cancelamos la auto-recarga del form...

    const title = taskform['task-title'];//Capturamos todo el contenido de las siguientes id dentro que vienen dentro del "task-form"
    const description = taskform['task-description'];

    if (!editStatus) {
        //si esta en false significa que quiere guardar asi que se ejecute el "saveTask()"
        await saveTask(title.value, description.value); //Como es una operacion asincrona devemos usar "async-await"
    }else {
        //De lo contrario que edite con updateTask el cual le paso el id, y unas variables que son el titulo y la descripcion de la tarea
        await updateTask(id, {
            title: title.value,
            description: description.value
        });

        editStatus = false;//ya editado cambiamos el status para que vuelva a la opcion de guardado o crear tarea
        id = ''; // volvemos a poner el id en blanco pues ya editamos ese id
        taskform['btn-task-form'].innerText = 'Guardar';//cambiamos de update a save nuevamente el boton
    }

    await getTasks();


    taskform.reset();//reseteamos el form
    title.focus();//al reset el form le damos focus al titulo para nuevo ingreso


});
