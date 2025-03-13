<template>
    <footer>
        <div class="flex flex-row space-x-24 font-semibold">
            <!-- Site Map -->
            <div>
                <div class="secondary-color mb-6">Site map</div>
                <nav>
                    <ul class="flex flex-col link-color space-y-4">
                        <NuxtLink to="/" class="hover-effect cursor-pointer w-fit">Home</NuxtLink>
                        <NuxtLink to="/projects" class="hover-effect cursor-pointer w-fit">Projects</NuxtLink>
                        <NuxtLink to="/about" class="hover-effect cursor-pointer w-fit">About</NuxtLink>
                        <NuxtLink to="/contact" class="hover-effect cursor-pointer w-fit">Contact</NuxtLink>
                    </ul>
                </nav>
            </div>

            <!-- Socials -->
            <div>
                <div class="secondary-color mb-6">Socials</div>
                <div class="link-color space-y-4">
                    <div class="hover-effect cursor-pointer w-fit">LinkedIn</div>
                    <div class="hover-effect cursor-pointer w-fit">Instagram</div>
                    <div class="hover-effect cursor-pointer w-fit">GitHub</div>
                </div>
            </div>
        </div>
        <div class="flex flex-row justify-between items-center mt-8">
            <img src="/assets/img/logo.svg" alt="Logo ERIEU" class="w-2/5" />
            <div class="smooth-underline font-bold cursor-pointer w-fit">Back on top ↑</div>
            <div class="font-bold">Copyright © ERIEU 2025</div>
        </div>
    </footer>
</template>

<style scoped>
.hover-effect {
    color: var(--link-color);
    transition: color 0.3s ease-in-out;
}

.hover-effect:hover {
    color: var(--secondary-color);
    transition: color 0.3s ease-in-out;
}

</style>