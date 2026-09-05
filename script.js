function explore() {

    document
        .getElementById("fields")
        .scrollIntoView({
            behavior: "smooth"
        });

}


function showMessage() {

    alert(
        "More information can be connected here using a database or API."
    );

}


function openVideos() {

    alert(
        "Farming video section is ready. You can add YouTube videos or your own videos here."
    );

}


function sendMessage() {

    alert(
        "Thank you! Your message has been received."
    );

}


function searchData() {

    let search =
        document
        .getElementById("search")
        .value
        .toLowerCase();

    if (search.includes("field")) {

        document
            .getElementById("fields")
            .scrollIntoView({
                behavior: "smooth"
            });

    }

    else if (search.includes("loan")) {

        document
            .getElementById("loans")
            .scrollIntoView({
                behavior: "smooth"
            });

    }

    else if (search.includes("fertilizer")) {

        document
            .getElementById("fertilizers")
            .scrollIntoView({
                behavior: "smooth"
            });

    }

    else if (search.includes("news")) {

        document
            .getElementById("news")
            .scrollIntoView({
                behavior: "smooth"
            });

    }

    else if (search.includes("tractor")) {

        document
            .getElementById("services")
            .scrollIntoView({
                behavior: "smooth"
            });

    }

    else {

        alert(
            "No matching section found. Try: field, loan, fertilizer, news or tractor."
        );

    }

}
