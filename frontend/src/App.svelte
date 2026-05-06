<script>
    const API = "https://mood-app-production-275e.up.railway.app";

    let page = "login";

    let username = "";
    let password = "";

    let loggedUser = localStorage.getItem("username");

    let moods = [];
    let selectedMood = null;
    let story = "";
    let quote = "";

    let showHistory = false;
    let histories = [];
    let editId = null;
    let editStory = "";

    if (loggedUser) {
        page = "dashboard";
        loadMoods();
    }

    // ======================
    // LOAD MOODS
    // ======================
    function loadMoods() {
        fetch(`${API}/moods`)
        .then(res => res.json())
        .then(data => moods = data)
        .catch(err => console.error("Error moods:", err));
    }

    // ======================
    // LOAD HISTORY
    // ======================
    function loadHistory() {
        if (!loggedUser) return;

        fetch(`${API}/history/${loggedUser}`)
        .then(res => res.json())
        .then(data => histories = data)
        .catch(err => console.error("Error history:", err));
    }

    // ======================
    // LOGIN
    // ======================
    function login() {
        fetch(`${API}/login`, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
                username: username.trim(),
                password: password.trim()
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem("username", username);
                loggedUser = username;
                page = "dashboard";
                loadMoods();
            } else {
                alert(data.message || "Login gagal 😭");
            }
        })
        .catch(err => console.error("Login error:", err));
    }

    // ======================
    // REGISTER
    // ======================
    function register() {
        fetch(`${API}/register`, {
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
        })
        .catch(err => console.error("Register error:", err));
    }

    function logout() {
        localStorage.removeItem("username");
        page = "login";
        loggedUser = null;
    }

    function selectMood(id) {
        selectedMood = id;
    }

    // ======================
    // SAVE ENTRY
    // ======================
    function save() {
        if (!selectedMood) {
            alert("Pilih mood dulu 😭");
            return;
        }

        fetch(`${API}/entry`, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
                username: loggedUser,
                mood_id: selectedMood,
                story
            })
        })
        .then(res => res.json())
        .then(() => {
            story = "";
            loadHistory();
        })
        .catch(err => console.error("Save error:", err));

        fetch(`${API}/quotes/${selectedMood}`)
        .then(res => res.json())
        .then(data => {
            quote = data[0]?.quote || "Tetap semangat ya 💖";
        })
        .catch(err => console.error("Quote error:", err));
    }

    function deleteHistory(id) {
        fetch(`${API}/delete/${id}`, {
            method: "DELETE"
        })
        .then(() => loadHistory())
        .catch(err => console.error("Delete error:", err));
    }

    function startEdit(h) {
        editId = h.id;
        editStory = h.story;
    }

    function updateHistory(id) {
        fetch(`${API}/update/${id}`, {
            method: "PUT",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ story: editStory })
        })
        .then(() => {
            editId = null;
            editStory = "";
            loadHistory();
        })
        .catch(err => console.error("Update error:", err));
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
    
    <button 
        style="position:absolute; top:10px; right:10px;"
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

    <button on:click={save}>Simpan</button>

    {#if quote}
        <p>✨ {quote}</p>
    {/if}

    <button on:click={logout}>Logout</button>
</div>

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
                    <button on:click={() => updateHistory(h.id)}>Simpan</button>
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