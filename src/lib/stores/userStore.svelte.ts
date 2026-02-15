class UserState {
    profile = $state({
        ID: 0,
        name: "",
        email: "",
    });

    setProfile(data: any) {
        this.profile = data;
    }

    updateName(newName: string) {
        this.profile.name = newName;
    }
}

export const userStore = new UserState();