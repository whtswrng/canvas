export interface File {
    name: string,
    content: string,
}

export class Files {
    private files: Array<File> = [];

    constructor(initialFiles: Array<File>) {
        this.initFiles(initialFiles);
    }

    public addFile(fileName: string) {
        this.files.push({name: fileName, content: ''});
    }

    public deleteFile(fileName: string) {
        this.files = this.files.filter((f) => f.name !== fileName);
    }

    public changeFileName(oldName: string, newName: string) {
        const file = this.files.find((f) => f.name == oldName);
        file.name = newName;
    }

    public initFiles(files?: Array<File>) {
        if(files) {
            this.files = files;
        }
    }

    public loadFile(fileName: string) {
        const file = this.files.find((f) => f.name === fileName);

        if(file) {
            return file.content;
        }
    }

    public changeFile(fileName: string, code: string) {
        const file = this.files.find((f) => f.name === fileName);

        if(file) {
            file.content = code;
            return true;
        }

        return false;
    }

    public getFiles() {
        return this.files;
    }
}