<script>
    let page = "login";

    let username = "";
    let password = "";

    let loggedUser = localStorage.getItem("username");

    let moods = [];
    let selectedMood = null;
    let story = "";
    let quote = "";

    // HISTORY STATE
    let showHistory = false;
    let histories = [];
    let editId = null;
    let editStory = "";

    if (loggedUser) {
        page = "dashboard";
        loadMoods();
    }

    function loadMoods() {
        fetch("http://localhost:3000/moods")
        .then(res => res.json())
        .then(data => moods = data)
        .catch(err => console.error(err));
    }

    function loadHistory() {
        if (!loggedUser) return;

        fetch(`http://localhost:3000/history/${loggedUser}`)
        .then(res => res.json())
        .then(data => {
            console.log("HISTORY:", data);
            histories = data;
        })
        .catch(err => console.error("Error:", err));
    }

    function login() {
        fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
                username: username.trim(),
                password: password.trim()
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success || data.message.includes("berhasil")) {
                localStorage.setItem("username", username);
                loggedUser = username;
                page = "dashboard";
                loadMoods();
            } else {
                alert(data.message || "Login gagal 😭");
            }
        });
    }

    function register() {
        fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
                username: username.trim(),
                password: password.trim()
            })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            page = "login";
        });
    }

    function logout() {
        localStorage.removeItem("username");
        page = "login";
        loggedUser = null;
    }

    function selectMood(id) {
        selectedMood = id;
    }

    function save() {
        if (!selectedMood) {
            alert("Pilih mood dulu 😭");
            return;
        }

        fetch("http://localhost:3000/entry", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
                username: loggedUser,
                mood_id: selectedMood,
                story
            })
        })
        .then(() => {
            story = "";
            loadHistory(); // refresh history
        });

        fetch(`http://localhost:3000/quotes/${selectedMood}`)
        .then(res => res.json())
        .then(data => {
            quote = data[0].quote;
        });
    }

    function deleteHistory(id) {
        fetch(`http://localhost:3000/delete/${id}`, {
            method: "DELETE"
        })
        .then(() => loadHistory())
        .catch(err => console.error(err));
    }

    function startEdit(h) {
        editId = h.id;
        editStory = h.story;
    }

    function updateHistory(id) {
        fetch(`http://localhost:3000/update/${id}`, {
            method: "PUT",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ story: editStory })
        })
        .then(() => {
            editId = null;
            editStory = "";
            loadHistory();
        })
        .catch(err => console.error(err));
    }
</script>

<!-- LOGIN -->
{#if page === "login"}
<div class="box">
    <h2>Login 💕</h2>

    <input placeholder="Username" bind:value={username}>
    <input type="password" placeholder="Password" bind:value={password}>

    <button on:click={login}>Login</button>
    <button on:click={() => page='register'}>Ke Register</button>
</div>
{/if}

<!-- REGISTER -->
{#if page === "register"}
<div class="box">
    <h2>Register 💖</h2>

    <input placeholder="Username" bind:value={username}>
    <input type="password" placeholder="Password" bind:value={password}>

    <button on:click={register}>Register</button>
    <button on:click={() => page='login'}>Ke Login</button>
</div>
{/if}

<!-- DASHBOARD -->
{#if page === "dashboard"}
<div class="box" style="position: relative;">
    
    <!-- BUTTON HISTORY -->
    <button 
        style="position:absolute; top:10px; right:10px; width:auto; padding:5px 10px;"
        on:click={() => { showHistory = true; loadHistory(); }}>
        📜
    </button>

    <h2>Halo, {loggedUser} 💕</h2>

    <div class="moods">
        {#each moods as m}
            <button 
                class:selected={selectedMood === m.id}
                on:click={() => selectMood(m.id)}>
                {m.name}
            </button>
        {/each}
    </div>

    <textarea bind:value={story} placeholder="cerita kamu hari ini..."></textarea>

    <button class="save-btn" on:click={save}>Simpan</button>

    {#if quote}
        <p>✨ {quote}</p>
    {/if}

    <button class="logout-btn" on:click={logout}>Logout</button>
</div>

<!-- HISTORY POPUP -->
{#if showHistory}
<div class="overlay">
    <div class="history-box">
        <h3>History Kamu 📖</h3>

        {#if histories.length === 0}
            <p>Tidak ada cerita 😢</p>
        {/if}

        {#each histories as h}
            <div class="item">
                <p><b>{h.created_at}</b></p>

                {#if editId === h.id}
                    <textarea bind:value={editStory}></textarea>
                    <button on:click={() => updateHistory(h.id)}>Simpan Edit</button>
                {:else}
                    <p>{h.story}</p>
                    <button on:click={() => startEdit(h)}>Edit</button>
                {/if}

                <button on:click={() => deleteHistory(h.id)}>Hapus</button>
            </div>
        {/each}

        <button on:click={() => showHistory = false}>Tutup</button>
    </div>
</div>
{/if}

{/if}

<style>
    :global(body) {
        margin: 0;
        height: 100vh;
        font-family: 'Poppins', sans-serif;
        background: linear-gradient(135deg, #ffd6e8, #ffc0cb);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .box {
        align-self: center;
        background: white;
        padding: 30px;
        border-radius: 18px;
        text-align: center;
        width: 350px;
    }.h2{
        color: #000000;
    }

    input, textarea {
    width: 100%;
    margin: 5px 0;
    padding: 10px;
    border-radius: 10px;
    background-color: rgba(200, 200, 200, 0.3); /* abu + transparan 30% */
    border: 1px solid rgba(0, 0, 0, 0.15); /* border tipis */
    color: black;

    outline: none;
}

    button {
        margin-top: 10px;
        padding: 10px;
        border-radius: 10px;
        border: none;
        width: 100%;
        background: #ff4f9a;
        color: white;
        cursor: pointer;
    }

    .logout-btn {
        background: gray;
    }

    .moods button {
        width: auto;
        margin: 5px;
        background: #ffe3ec;
        color: black;
    }

    .moods button.selected {
        background: #ff4f9a;
        color: white;
    }

    /* OVERLAY */
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.4);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
    }

    .history-box {
        background: white;
        padding: 20px;
        border-radius: 15px;
        width: 300px;
        max-height: 400px;
        overflow-y: auto;
    }

    .item {
        margin-bottom: 15px;
        border-bottom: 1px solid #ccc;
    }
</style>