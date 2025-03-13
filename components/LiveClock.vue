<template>
    <div class="text-xl font-medium secondary-color">
        Reims, France | {{ time }}
    </div>
</template>

<script>
export default {
    name: 'LiveClock',
    props: {
        timezone: {
            type: String,
            default: 'Europe/Paris'
        }
    },
    data() {
        return {
            time: '',
            timer: null
        };
    },
    mounted() {
        this.updateTime();
        this.timer = setInterval(this.updateTime, 1000);
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    },
    methods: {
        updateTime() {
            this.time = new Date().toLocaleTimeString('fr-FR', { timeZone: this.timezone });
        }
    }
};
</script>
