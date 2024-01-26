<template>
    <div class="container">
        <div class="row">
            <h1>{{fam.replaceAll("_"," ")}} Tune Family</h1>
        </div>
        <div class="row">
            <div class="col-12">
                <table v-if="tuneFamilyList.length > 0" class="table table-hover mt-3">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>ID</th>
                        <th>Type</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(tune, index) in tuneFamilyList" :key="index" @click="openDetails(tune.id.value)">
                        <td>{{ "title" in tune && tune.title.value ? tune.title.value.replace(/^(.*?)(?:, The)$/, "The $1") : 'Unknown' }}</td>
                        <td>{{ tune.id.value }}</td>
                        <td>{{ "type" in tune && tune.type.value ? tune.type.value : 'Unknown' }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: 'TuneFamilyPage',
    data() {
        return {
            fam: this.$route.params.fam,
            tuneFamilyList: [],
        }
    },
    methods: {
        getTuneFamilyMembers(fam){
            let params = {
                family: fam
            };
            axios.get(process.env.VUE_APP_SERVER_URL + '/api/tuneFamilyMembers', { params })
                .then(response => {
                    this.tuneFamilyList = response.data.results.bindings;
                })
                .catch(error => {
                    console.error(error);
                });
        },
        openDetails(id) {
            this.$router.push({ name: 'CompositionPage', params: { id: id}});
        },
    },
    mounted() {
        this.getTuneFamilyMembers(this.fam);
    }
}
</script>


<style scoped>

</style>